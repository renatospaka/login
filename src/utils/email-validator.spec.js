const validator = require('validator')

const makeSUT = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  class EmailValidator {
    isValid (email) {
      return validator.isEmail(email)
    }
  }

  test('Should return true if validator returns true', () => {
    const sut = makeSUT()
    const isEmailValid = sut.isValid('valid@email.com')
    expect(isEmailValid).toBe(true)
  })

  test('Should return false if validator returns false', () => {
    validator.isEmailValid = false
    const sut = makeSUT()
    const isEmailValid = sut.isValid('invalid@email.com')
    expect(isEmailValid).toBe(false)
  })

  npm install validator
})
