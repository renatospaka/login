const HttpResponse = require('../helpers/http-response')

module.exports = class LoginRouter {
  constructor (authUseCase) {
    this.authUseCase = authUseCase
  }

  route (httpRequest) {
    // if (!httpRequest || !httpRequest.body || !this.authUseCase || !this.authUseCase.auth) {
    //   return HttpResponse.serverError()
    // }

    try {
      const { email, password } = httpRequest.body
      if (!email) {
        return HttpResponse.badRequest('email')
      }
      if (!password) {
        return HttpResponse.badRequest('password')
      }

      const token = this.authUseCase.auth(email, password)
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
