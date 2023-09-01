const { createToken } = require('./createToken');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

describe('createToken', function() {
  const user = { username: 'testuser', isAdmin: false };

  it('should return a JWT token', function() {
    const token = createToken(user);
    expect(token).toBeDefined();
  });

  it('should include the username in the payload', function() {
    const token = createToken(user);
    const decoded = jwt.verify(token, SECRET_KEY);
    expect(decoded.username).toEqual(user.username);
  });

  it('should include the isAdmin property in the payload', function() {
    const token = createToken(user);
    const decoded = jwt.verify(token, SECRET_KEY);
    expect(decoded.isAdmin).toEqual(user.isAdmin);
  });

});