class Token {
  address: string
  decimal: u8
}

class TokenType {
  usdc: Token
  weth: Token
  InstaFlashAggregator: string
}

class TokenObj {
  main: TokenType
  polygon: TokenType
  arbitrum : TokenType
  avalanch : TokenType
  optimism : TokenType
  fantom : TokenType
}

const TokenList: TokenObj = {
  main: {
    usdc: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimal: 6
    },
    weth: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimal: 18
    },
    InstaFlashAggregator: "0x619Ad2D02dBeE6ebA3CDbDA3F98430410e892882"
  },
  polygon: {
    usdc: {
      address: "",
      decimal: 18
    },
    weth: {
      address: "",
      decimal: 18
    },
    InstaFlashAggregator: "0xB2A7F20D10A006B0bEA86Ce42F2524Fde5D6a0F4"
  },
  arbitrum: {
    usdc: {
      address: "",
      decimal: 18
    },
    weth: {
      address: "",
      decimal: 18
    },
    InstaFlashAggregator: "0x1f882522DF99820dF8e586b6df8bAae2b91a782d"
  },
  avalanch: {
    usdc: {
      address: "",
      decimal: 18
    },
    weth: {
      address: "",
      decimal: 18
    },
    InstaFlashAggregator: "0x2b65731A085B55DBe6c7DcC8D717Ac36c00F6d19"
  },
  optimism: {
    usdc: {
      address: "",
      decimal: 18
    },
    weth: {
      address: "",
      decimal: 18
    },
    InstaFlashAggregator: "0x84e6b05a089d5677a702cf61dc14335b4be5b282"
  },
  fantom: {
    usdc: {
      address: "",
      decimal: 18
    },
    weth: {
      address: "",
      decimal: 18
    },
    InstaFlashAggregator: ""
  }
}

export default TokenList;