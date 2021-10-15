const HttpResponse = require('../helpers/http-response')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class LoginRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async route (httpRequest) {
    // if (!httpRequest || !httpRequest.body || !this.authUseCase || !this.authUseCase.auth) {
    //   return HttpResponse.serverError()
    // }

    try {
      const { email, password } = httpRequest.body
      if (!email) {
        return HttpResponse.badRequest(new MissingParamError('email'))
      }
      if (!this.emailValidator.isValid(email)) {
        return HttpResponse.badRequest(new InvalidParamError('email'))
      }
      if (!password) {
        return HttpResponse.badRequest(new MissingParamError('password'))
      }

      const token = await this.authUseCase.auth(email, password)
      if (!token) {
        return HttpResponse.unauthorizedError()
      }

      return HttpResponse.ok({ token })
    } catch (error) {
      // console.error(error)
      return HttpResponse.serverError()
    }
  }
}
