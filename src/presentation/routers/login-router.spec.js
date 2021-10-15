const LoginRouter = require('./login-router')
const InvalidParamError = require('../helpers/invalid-param-error')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const ServerError = require('../helpers/server-error')

const makeSUT = () => {
  const authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  authUseCaseSpy.token = 'valid-token'
  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }

  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isValid = true
  return emailValidatorSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid () {
      throw new Error()
    }
  }
  return new EmailValidatorSpy()
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.token
    }
  }
  return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  }
  return new AuthUseCaseSpy()
}

describe('Login Router', () => {
  test('Should return 400 when no email is provided', async () => {
    // sut = subject under test
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        password: 'any'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 when no password is provided', async () => {
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 when an invalid password is provided', async () => {
    const { sut, emailValidatorSpy } = makeSUT()
    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'any'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSUT()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.token).toEqual(new ServerError())
  })

  test('Should return 500 if httpRequest has no body', async () => {
    // sut = subject under test
    const { sut } = makeSUT()
    const httpResponse = await sut.route({})
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.token).toEqual(new ServerError())
  })

  test('Should execute AuthUseCase with proper parameters', async () => {
    const { sut, authUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSUT()
    authUseCaseSpy.token = null
    const httpRequest = {
      body: {
        password: 'invalid_password',
        email: 'invalid_email@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 500 if no AuthUseCase is provided', async () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.token).toEqual(new ServerError())
  })

  test('Should return 500 if AuthUseCase has no auth method', async () => {
    const sut = new LoginRouter({})
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if AuthUseCase throws exception', async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError()
    const sut = new LoginRouter(authUseCaseSpy)
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 500 if no EmailValidator is provided', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const sut = new LoginRouter(authUseCaseSpy)
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.token).toEqual(new ServerError())
  })

  test('Should return 500 if EmailValidator has no isValid method', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const sut = new LoginRouter(authUseCaseSpy, {})
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should execute EmailValidator with proper parameters', async () => {
    const { sut, emailValidatorSpy } = makeSUT()
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    await sut.route(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })

  test('Should return 500 if EmailValidator throws exception', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidatorWithError()
    const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
    const httpRequest = {
      body: {
        password: 'any',
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        password: 'valid_password',
        email: 'valid_email@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.token).toEqual(authUseCaseSpy.token)
  })
})
