module.exports = {
  isEmailValid: true,
  email: '',
  isValid (email) {
    this.email = email
    return this.isEmailValid
  }
}
