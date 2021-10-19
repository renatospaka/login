const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSUT = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)

  return {
    sut,
    loadUserByEmailRepositorySpy
  }
}

describe('Auth Usecase', () => {
  test('Should throw exception when no email is provided', async () => {
    const { sut } = makeSUT()
    const promiseToken = sut.auth()
    expect(promiseToken).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw exception when no password is provided', async () => {
    const { sut } = makeSUT()
    const promiseToken = sut.auth('any-email@email.com')
    expect(promiseToken).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmail with proper params', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSUT()
    await sut.auth('any-email@email.com', 'any-password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any-email@email.com')
  })

  test('Should throw exception if no LoadUserByEmail is provided', async () => {
    const sut = new AuthUseCase()
    const promiseToken = sut.auth('any-email@email.com', 'any-password')
    expect(promiseToken).rejects.toThrow()
  })

  test('Should throw exception if LoadUserByEmail has no load method', async () => {
    const sut = new AuthUseCase({})
    const promiseToken = sut.auth('any-email@email.com', 'any-password')
    expect(promiseToken).rejects.toThrow()
  })

  test('Should return null if LoadUserByEmailRepository returns null', async () => {
    const { sut } = makeSUT()
    const accessToken = sut.auth('invalid-email@email.com', 'any-password')
    expect(accessToken).toBeNull()
  })
})
