const EmailValidator = require('./email-validator')
const validator = require('validator')

const makeSUT = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
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

  test('Should execute validator with proper parameters', () => {
    const sut = makeSUT()
    sut.isValid('any@email.com')
    expect(validator.email).toBe('any@email.com')
  })

  npm install validator
})
