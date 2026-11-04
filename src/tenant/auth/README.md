# Tenant authentication

Tenant authentication is intentionally isolated from platform authentication. The frontend login is currently a preview flow; do not create a token, assume an endpoint, or enable a protected tenant guard until the Laravel login response, token lifetime and current-user contract are confirmed.

Once the backend contract is available, implement tenant login/logout, session hydration, expiry handling and 401 invalidation here.
