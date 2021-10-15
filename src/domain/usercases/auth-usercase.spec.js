const { MissingParamError } = require('../../utils/errors')

class AuthUseCase {
  constructor (loadUserByEmail) {
    this.loadUserByEmail = loadUserByEmail
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }

    await this.loadUserByEmail.load(email)
  }
}

describe('Auth Usecase', () => {
  test('Should throw exception when no email is provided', async () => {
    const sut = new AuthUseCase()
    const promiseToken = sut.auth()
    expect(promiseToken).reject.toThrow(new MissingParamError('email'))
  })

  test('Should throw exception when no password is provided', async () => {
    const sut = new AuthUseCase()
    const promiseToken = sut.auth('any-email@email.com')
    expect(promiseToken).reject.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmail with proper params', async () => {
    class LoadUserByEmailSpy {
      async load (email) {
        this.email = email
      }
    }
    const loadUserByEmailSpy = new LoadUserByEmailSpy()
    const sut = new AuthUseCase(loadUserByEmailSpy)
    await sut.auth('any-email@email.com', 'any-password')
    expect(loadUserByEmailSpy.email).toBe('any-email@email.com')
  })
})
