use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc, RwLock,
    },
    time::Instant,
};

use actix::*;
use actix_cors::Cors;
use actix_web::{
    middleware::Logger, post, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder, http,
};
use actix_web_actors::ws;
use base64::{engine::general_purpose, Engine};
use models::AppState;

use crate::models::RegisterPayload;

mod models;
mod server;
mod session;
mod utils;

#[post("/register")]
async fn register(
    data: web::Json<RegisterPayload>,
    app_state: web::Data<AppState>,
) -> impl Responder {
    let RegisterPayload { username, password } = data.into_inner();
    let token = general_purpose::STANDARD.encode(&format!("{}:{}", username, password));
    let accounts = app_state.accounts.read().unwrap();

    // check if the account already exists
    if accounts.contains_key(&token) {
        return HttpResponse::Conflict()
            .body("this exact username and password already exists lol");
    }

    // check if the username already exists
    if accounts.values().any(|v| v == &username) {
        return HttpResponse::Conflict().body("Username already exists");
    }

    drop(accounts);

    // store thee account in the global state
    app_state
        .accounts
        .write()
        .unwrap()
        .insert(token.clone(), username.clone());
    HttpResponse::Ok().body("Registration successful")
}

#[post("/login")]
async fn login(data: web::Json<RegisterPayload>, app_data: web::Data<AppState>) -> impl Responder {
    let RegisterPayload { username, password } = data.into_inner();
    let token = general_purpose::STANDARD.encode(&format!("{}:{}", username, password));
    let accounts = app_data.accounts.read().unwrap();

    if accounts.contains_key(&token) {
        return HttpResponse::Ok().body("Login successful");
    }

    HttpResponse::Unauthorized().body("Invalid credentials")
}

/// Entry point for our websocket route
async fn chat_route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<server::ChatServer>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        session::WsChatSession {
            id: 0,
            token: None,
            hb: Instant::now(),
            room: "main".to_owned(),
            name: None,
            addr: srv.get_ref().clone(),
        },
        &req,
        stream,
    )
}

/// Displays state
async fn get_count(count: web::Data<AtomicUsize>) -> impl Responder {
    let current_count = count.load(Ordering::SeqCst);
    format!("Visitors: {current_count}")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // set up applications state
    // keep a count of the number of visitors and hold a list of accounts
    let app_state = Arc::new(AppState {
        total_visitors: Arc::new(AtomicUsize::new(0)),
        accounts: Arc::new(RwLock::new(HashMap::new())),
    });

    // start chat server actor
    let server =
        server::ChatServer::new(app_state.total_visitors.clone(), app_state.accounts.clone())
            .start();

    log::info!("starting HTTP server at http://localhost:8080");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::from(app_state.clone()))
            .app_data(web::Data::new(server.clone()))
            .wrap(
                Cors::default()
                    .send_wildcard()
                    .allowed_origin("http://localhost:3000")
                    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
                    .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT, http::header::CONTENT_TYPE]),
            )
            .service(register)
            .service(login)
            .route("/count", web::get().to(get_count))
            .route("/ws", web::get().to(chat_route))
            .wrap(Logger::default())
    })
    .workers(2)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
