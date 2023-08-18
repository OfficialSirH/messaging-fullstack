use actix_web::Error;
use base64::{engine::general_purpose, Engine};

pub trait InvalidItems<T> {
  fn invalid_auth(self) -> Result<T, Error>;

  fn invalid_header(self) -> Result<T, Error>;
}

impl<T> InvalidItems<T> for Option<T> {
  fn invalid_auth(self) -> Result<T, Error> {
      self.ok_or_else(|| actix_web::error::ErrorBadRequest("Invalid authorization header"))
  }

  fn invalid_header(self) -> Result<T, Error> {
      self.ok_or_else(|| actix_web::error::ErrorBadRequest("Invalid header"))
  }
}

impl<T, E: core::fmt::Debug> InvalidItems<T> for Result<T, E> {
  fn invalid_auth(self) -> Result<T, Error> {
      self.map_err(|_| actix_web::error::ErrorBadRequest("Invalid authorization header"))
  }

  fn invalid_header(self) -> Result<T, Error> {
      self.map_err(|_| actix_web::error::ErrorBadRequest("Invalid header"))
  }
}

/// Parse the authorization header and return the username and password.
///
/// The authorization header is in the format of:
/// `"Basic {base64(username:password)}"`
pub fn basic_auth(auth_header: String) -> Result<(String, String), Error> {
  // let auth_header = req
  //     .headers()
  //     .get("authorization")
  //     .invalid_auth()?
  //     .to_str()
  //     .invalid_auth()?;

  // split auth header from "Basic {auth}"
  let auth_header = auth_header.split_whitespace().collect::<Vec<_>>();

  // check if auth header is "Basic"
  if *auth_header.first().invalid_auth()? != "Basic" {
      return Err(actix_web::error::ErrorBadRequest(
          "Invalid authorization header",
      ));
  }

  // obtain the base64 string from the header
  let auth_header = auth_header.get(1).invalid_auth()?;
  // decode base64 from the string
  let auth_header = general_purpose::STANDARD
      .decode(auth_header)
      .invalid_auth()?;

  // convert the bytes to a string
  let auth_header = String::from_utf8(auth_header).invalid_auth()?;

  // get the username and password from the username:password
  let auth_header = auth_header.split(':').collect::<Vec<_>>();
  let username = auth_header.first().invalid_auth()?;
  let password = auth_header.get(1).invalid_auth()?;

  Ok((username.to_string(), password.to_string()))
}

pub fn parse_basic_auth_token(token: String) -> Result<(String, String), Error> {
  let token = general_purpose::STANDARD.decode(token).invalid_auth()?;
  let token = String::from_utf8(token).invalid_auth()?;

  let token = token.split(':').collect::<Vec<_>>();
  let username = token.first().invalid_auth()?;
  let password = token.get(1).invalid_auth()?;

  Ok((username.to_string(), password.to_string()))
}
