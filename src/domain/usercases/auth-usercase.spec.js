class AuthUseCase {
  async auth (email) {
    if (!email) {
      throw new Error()
    }
  }
}

describe('Auth Usecase', () => {
  test('Should throw exception when no email is provided', async () => {
    const sut = new AuthUseCase()
    const promiseToken = sut.auth()
    expect(promiseToken).reject.toThrow()
  })
})
