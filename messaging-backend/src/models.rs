use std::{sync::{Arc, RwLock, atomic::AtomicUsize}, collections::HashMap};

use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct RegisterPayload {
    pub username: String,
    pub password: String,
}

#[derive(Clone)]
pub struct AppState {
    /// total amount of users visited
    pub total_visitors: Arc<AtomicUsize>,

    /// total amount of user accounts
    pub accounts: Arc<RwLock<HashMap<String, String>>>,
}
