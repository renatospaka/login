const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true
  return encrypterSpy
}

const makeTokenyzer = () => {
  class TokenyzerSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenyzerSpy = new TokenyzerSpy()
  tokenyzerSpy.accessToken = 'any-token'
  return tokenyzerSpy
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  loadUserByEmailRepositorySpy.user = {
    password: 'hashed-password',
    id: 'any-id'
  }
  return loadUserByEmailRepositorySpy
}

const makeSUT = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenyzerSpy = makeTokenyzer()
  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenyzer: tokenyzerSpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenyzerSpy
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
    const sut = new AuthUseCase({})
    const promiseToken = sut.auth('any-email@email.com', 'any-password')
    expect(promiseToken).rejects.toThrow()
  })

  test('Should throw exception if LoadUserByEmail has no load method', async () => {
    const sut = new AuthUseCase({ loadUserByEmailRepository: {} })
    const promiseToken = sut.auth('any-email@email.com', 'any-password')
    expect(promiseToken).rejects.toThrow()
  })

  test('Should return null when an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSUT()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = sut.auth('invalid-email@email.com', 'any-password')
    expect(accessToken).toBeNull()
  })

  test('Should return null when an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSUT()
    encrypterSpy.isValid = false
    const accessToken = sut.auth('any-email@email.com', 'invalid-password')
    expect(accessToken).toBeNull()
  }) 

  test('Should call Encrypter with proper values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSUT()
    await sut.auth('any-email@email.com', 'any-password')
    expect(encrypterSpy.password).toBe('any-password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.password)
  })

  test('Should call Tokenyzer with proper userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenyzerSpy } = makeSUT()
    await sut.auth('valid-email@email.com', 'valid-password')
    expect(tokenyzerSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('Should return a valid accessToken when valid credentials', async () => {
    const { sut, tokenyzerSpy } = makeSUT()
    const accessToken = await sut.auth('valid-email@email.com', 'valid-password')
    expect(accessToken).toBe(tokenyzerSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })
})
