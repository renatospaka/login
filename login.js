const express = require('express')
const router = express.Router()

module.exports = () => {
  const signupRouter = new SignupRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(signupRouter))
}

class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }
      const httpResponse = await router.route(httpRequest)
      return res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

// signup-router
class SignupRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body
    const user = new SignupUseCase().signup(email, password, repeatPassword)
    return {
      statusCode: 200,
      body: user
    }
  }
}

// signup-usercase
class SignupUseCase {
  async signup (email, password, repeatPassword) {
    if (password === repeatPassword) {
      return new AddAccountRepository().add(email, password)
    }
  }
}

// add-account-repo
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

class AddAccountRepository {
  async add (email, password) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}
