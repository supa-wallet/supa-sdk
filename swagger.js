
window.onload = function() {
    // Build a system
    let url = window.location.search.match(/url=([^&]+)/);
    if (url && url.length > 1) {
      url = decodeURIComponent(url[1]);
    } else {
      url = window.location.origin;
    }
    let options = {
    "swaggerDoc": {
      "openapi": "3.0.0",
      "paths": {
        "/canton/register/prepare": {
          "post": {
            "operationId": "CantonRegisterController_prepare",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonPrepareRegisterRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully prepared hash for signing",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPrepareTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/register/submit": {
          "post": {
            "operationId": "CantonRegisterController_submit",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonSubmitRegisterRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully submitted and registered external party",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPartyInfoDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/dialogs": {
          "post": {
            "operationId": "DialogsController_create",
            "parameters": [],
            "requestBody": {
              "required": true,
              "description": "New dialog params",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NewDialogRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "New dialog created",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/DialogWithMessagesResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          },
          "get": {
            "operationId": "DialogsController_findAll",
            "parameters": [
              {
                "name": "limit",
                "required": false,
                "in": "query",
                "min": 1,
                "max": 100,
                "int": true,
                "schema": {
                  "default": 10,
                  "type": "number"
                }
              },
              {
                "name": "page",
                "required": false,
                "in": "query",
                "min": 1,
                "int": true,
                "schema": {
                  "default": 1,
                  "type": "number"
                }
              },
              {
                "name": "order",
                "required": false,
                "in": "query",
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "List of all user dialogs",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/OffsetPaginatedDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          }
        },
        "/dialogs/{id}": {
          "delete": {
            "operationId": "DialogsController_remove",
            "parameters": [
              {
                "name": "id",
                "required": true,
                "in": "path",
                "schema": {
                  "type": "number"
                }
              }
            ],
            "responses": {
              "204": {
                "description": "Dialog successfully deleted"
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          },
          "get": {
            "operationId": "DialogsController_findOne",
            "parameters": [
              {
                "name": "id",
                "required": true,
                "in": "path",
                "schema": {
                  "type": "number"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Get specific dialog",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/DialogListResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          }
        },
        "/dialogs/{dialogId}/messages": {
          "post": {
            "operationId": "MessagesController_create",
            "parameters": [
              {
                "name": "dialogId",
                "required": true,
                "in": "path",
                "schema": {
                  "type": "number"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "description": "New message content",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NewMessageRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Message added to dialog",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/MessageResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          },
          "get": {
            "operationId": "MessagesController_findAll",
            "parameters": [
              {
                "name": "dialogId",
                "required": true,
                "in": "path",
                "schema": {
                  "type": "number"
                }
              },
              {
                "name": "limit",
                "required": false,
                "in": "query",
                "min": 1,
                "max": 100,
                "int": true,
                "schema": {
                  "default": 10,
                  "type": "number"
                }
              },
              {
                "name": "page",
                "required": false,
                "in": "query",
                "min": 1,
                "int": true,
                "schema": {
                  "default": 1,
                  "type": "number"
                }
              },
              {
                "name": "order",
                "required": false,
                "in": "query",
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "List of all messages in the dialog",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/OffsetPaginatedDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          }
        },
        "/messages/{id}": {
          "get": {
            "operationId": "MessagesController_findOne",
            "parameters": [
              {
                "name": "id",
                "required": true,
                "in": "path",
                "schema": {
                  "type": "number"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Get specific message",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/MessageResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Chats"
            ]
          }
        },
        "/privy/balance": {
          "get": {
            "operationId": "PrivyController_getBalance",
            "parameters": [],
            "responses": {
              "200": {
                "description": ""
              }
            },
            "tags": [
              "Privy"
            ]
          }
        },
        "/user/me": {
          "get": {
            "operationId": "UserController_getCurrentUser",
            "parameters": [],
            "responses": {
              "200": {
                "description": "Current user information",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/UserResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "User"
            ]
          }
        },
        "/user/all": {
          "get": {
            "operationId": "UserController_getAll",
            "parameters": [],
            "responses": {
              "200": {
                "description": "All users list",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/UserResponseDto"
                      }
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "User"
            ]
          }
        },
        "/user/smart_wallet_balances": {
          "get": {
            "operationId": "UserController_getAccountTokensBalances",
            "parameters": [
              {
                "name": "force",
                "required": false,
                "in": "query",
                "description": "Force load data",
                "schema": {
                  "example": false,
                  "type": "boolean"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Current user balances",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/UserBalanceResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "User"
            ]
          }
        },
        "/user/{privyUserId}": {
          "get": {
            "operationId": "UserController_getUser",
            "parameters": [
              {
                "name": "privyUserId",
                "required": true,
                "in": "path",
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "User information",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/UserResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              },
              "404": {
                "description": "User not found"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "User"
            ]
          }
        },
        "/onchain/tokens_prices_by_addresses": {
          "post": {
            "operationId": "OnchainController_getTokensPricesByAddresses",
            "parameters": [],
            "requestBody": {
              "required": true,
              "description": "Array of pairs of alchemy network and contract address",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetPricesByAddressesBodyDto"
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Prices for the given addresses",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/NetworkAddressAndPriceDto"
                      }
                    }
                  }
                }
              }
            },
            "tags": [
              "OnChain"
            ]
          }
        },
        "/onchain/tokens_prices": {
          "get": {
            "operationId": "OnchainController_getPrices",
            "parameters": [
              {
                "name": "symbols",
                "required": true,
                "in": "query",
                "description": "Comma-separated list of symbols",
                "schema": {
                  "example": "BTC,ETH,USDT",
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Prices for the given symbols and network",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "additionalProperties": {
                        "type": "number"
                      },
                      "example": {
                        "BTC": 45000,
                        "ETH": 3200,
                        "USDT": 1
                      }
                    }
                  }
                }
              }
            },
            "tags": [
              "OnChain"
            ]
          }
        },
        "/onchain/token_price_history": {
          "get": {
            "operationId": "OnchainController_getTokenHistoricalPrice",
            "parameters": [
              {
                "name": "limit",
                "required": false,
                "in": "query",
                "min": 1,
                "max": 168,
                "int": true,
                "schema": {
                  "default": 10,
                  "type": "number"
                }
              },
              {
                "name": "page",
                "required": false,
                "in": "query",
                "min": 1,
                "int": true,
                "schema": {
                  "default": 1,
                  "type": "number"
                }
              },
              {
                "name": "order",
                "required": false,
                "in": "query",
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              },
              {
                "name": "contractAddress",
                "required": true,
                "in": "query",
                "description": "Contract address",
                "schema": {
                  "example": "0x0000000000000000000000000000000000000000",
                  "type": "string"
                }
              },
              {
                "name": "network",
                "required": true,
                "in": "query",
                "description": "Alchemy network",
                "schema": {
                  "example": "eth-mainnet",
                  "type": "string",
                  "enum": [
                    "eth-mainnet",
                    "arb-mainnet",
                    "opt-mainnet",
                    "polygon-mainnet"
                  ]
                }
              },
              {
                "name": "interval",
                "required": false,
                "in": "query",
                "description": "Time interval",
                "schema": {
                  "default": "ONE_HOUR",
                  "example": "ONE_HOUR",
                  "type": "string",
                  "enum": [
                    "ONE_HOUR",
                    "ONE_DAY",
                    "ONE_MONTH",
                    "ONE_YEAR",
                    "ALL_TIME"
                  ]
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Price history for the given symbol and network",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "example": {
                        "symbol": "ETH",
                        "currency": "usd",
                        "data": [
                          {
                            "value": "3448.1404369609",
                            "timestamp": "2025-01-03T00:00:00Z"
                          }
                        ]
                      }
                    }
                  }
                }
              },
              "422": {
                "description": "Token not found"
              }
            },
            "tags": [
              "OnChain"
            ]
          }
        },
        "/onchain/tokens_24hr_changes": {
          "post": {
            "operationId": "OnchainController_getTokens24hrPriceChanges",
            "parameters": [],
            "requestBody": {
              "required": true,
              "description": "Array of pairs of alchemy network and contract address",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GetTokens24hrPriceChangeParams"
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Prices for the given addresses",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/TokenInfoWithPriceChangeDto"
                      }
                    }
                  }
                }
              }
            },
            "tags": [
              "OnChain"
            ]
          }
        },
        "/onchain/token_info/{network}": {
          "get": {
            "description": "Returns Map LOWER_CONTRACT_ADDRESS -> TOKEN_INFO. Lowercased!!!",
            "operationId": "OnchainController_getTokenInfo",
            "parameters": [
              {
                "name": "network",
                "required": true,
                "in": "path",
                "description": "Blockchain network",
                "schema": {
                  "example": "eth-mainnet",
                  "type": "string"
                }
              },
              {
                "name": "token",
                "required": true,
                "in": "query",
                "description": "Token's address or comma-separated list of token addresses",
                "examples": {
                  "single": {
                    "value": "0xdac17f958d2ee523a2206206994597c13d831ec7",
                    "description": "Single token address (USDT)"
                  },
                  "multiple": {
                    "value": "0xdac17f958d2ee523a2206206994597c13d831ec7,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    "description": "Multiple token addresses (USDT,USDC)"
                  }
                },
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Token metadata for the given token address(es)",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "description": "Record of token addresses to their metadata",
                      "example": {
                        "0xdac17f958d2ee523a2206206994597c13d831ec7": {
                          "network": "eth-mainnet",
                          "logo": "https://static.alchemyapi.io/images/assets/825.png",
                          "name": "Tether USD",
                          "website": "https://tether.to",
                          "description": "Tether is a stablecoin pegged to the US Dollar",
                          "explorer": "https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7",
                          "type": "ERC20",
                          "symbol": "USDT",
                          "decimals": 6,
                          "status": "active",
                          "tags": [
                            "stablecoin"
                          ],
                          "id": "0xdac17f958d2ee523a2206206994597c13d831ec7",
                          "links": []
                        },
                        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
                          "network": "eth-mainnet",
                          "logo": "https://static.alchemyapi.io/images/assets/7129.png",
                          "name": "USD Coin",
                          "website": "https://www.circle.com/usdc",
                          "description": "USDC is a fully collateralized US dollar stablecoin",
                          "explorer": "https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                          "type": "ERC20",
                          "symbol": "USDC",
                          "decimals": 6,
                          "status": "active",
                          "tags": [
                            "stablecoin"
                          ],
                          "id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                          "links": []
                        }
                      }
                    }
                  }
                }
              }
            },
            "summary": "Get token info",
            "tags": [
              "OnChain"
            ]
          }
        },
        "/onchain/account_tokens_balances/{network}": {
          "get": {
            "operationId": "OnchainController_getAccountTokensBalances",
            "parameters": [
              {
                "name": "network",
                "required": true,
                "in": "path",
                "description": "Blockchain network",
                "schema": {
                  "example": "eth-mainnet",
                  "type": "string"
                }
              },
              {
                "name": "account",
                "required": true,
                "in": "query",
                "description": "Account address",
                "schema": {
                  "example": "0x3877fbDe425d21f29F4cB3e739Cf75CDECf8EdCE",
                  "type": "string"
                }
              },
              {
                "name": "force",
                "required": false,
                "in": "query",
                "description": "Force load data",
                "schema": {
                  "example": false,
                  "type": "boolean"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Account Tokens balances for the given network",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "example": {
                        "symbol": "ETH",
                        "currency": "usd",
                        "data": {
                          "address": "0x3877fbde425d21f29f4cb3e739cf75cdecf8edce",
                          "tokenBalances": [
                            {
                              "contractAddress": "0x0000000000000000000000000000000000000000",
                              "tokenBalance": "24221626233039190",
                              "error": null
                            },
                            {
                              "contractAddress": "0x557b933a7c2c45672b610f8954a3deb39a51a8ca",
                              "tokenBalance": "0x0000000000000000000000000000000000000000000000000000000000000000"
                            },
                            {
                              "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
                              "tokenBalance": "0x0000000000000000000000000000000000000000000000000000000000066865"
                            },
                            {
                              "contractAddress": "0xec53bf9167f50cdeb3ae105f56099aaab9061f83",
                              "tokenBalance": "0x0000000000000000000000000000000000000000000000003cbfe0618ec84ea8"
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            },
            "tags": [
              "OnChain"
            ]
          }
        },
        "/transactions/transactions_force": {
          "post": {
            "operationId": "TransactionsController_postTransactionsForce",
            "parameters": [
              {
                "name": "withScam",
                "required": false,
                "in": "query",
                "description": "Should we include scam in response",
                "schema": {
                  "default": false,
                  "example": true,
                  "type": "boolean"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Force load user transactions"
              },
              "401": {
                "description": "Unauthorized"
              },
              "429": {
                "description": "Rate limit exceeded - maximum 1 request per minute allowed"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Transactions"
            ]
          }
        },
        "/transactions": {
          "get": {
            "operationId": "TransactionsController_getTransactions",
            "parameters": [
              {
                "name": "withScam",
                "required": false,
                "in": "query",
                "description": "Should we include scam in response",
                "schema": {
                  "default": false,
                  "example": true,
                  "type": "boolean"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Get user transactions"
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Transactions"
            ]
          }
        },
        "/tatum/webhook_address_event": {
          "post": {
            "operationId": "TatumController_create",
            "parameters": [],
            "responses": {
              "200": {
                "description": ""
              }
            },
            "tags": [
              "Tatum"
            ]
          }
        },
        "/canton/devnet/tap": {
          "post": {
            "operationId": "CantonDevnetController_tap",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonPrepareTapRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully prepared hash for signing",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPrepareTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/submit_prepared": {
          "post": {
            "operationId": "CantonApiController_submit_prepared",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonSubmitRegisterRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully submitted signed transaction",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonSubmitTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/accept_cantara_offer": {
          "post": {
            "operationId": "CantonApiController_acceptCantaraOffer",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonAcceptCantaraOfferRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully prepared subscription offer acceptance hash for signing",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPrepareTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/balances": {
          "get": {
            "operationId": "CantonApiController_getBalances",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Get wallet token balances grouped by instrument ID",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonWalletBalancesResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/prepare_transfer_preapproval": {
          "post": {
            "operationId": "CantonApiController_prepareTransferPreapproval",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "responses": {
              "201": {
                "description": "Successfully prepared transfer preapproval hash for signing",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPrepareTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/prepare_amulet_transfer": {
          "post": {
            "operationId": "CantonApiController_prepareAmuletTransfer",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonPrepareAmuletTransferRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully prepared Amulet transfer hash for signing",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPrepareTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/prepare_transaction": {
          "post": {
            "operationId": "CantonApiController_prepare_transaction",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CantonPrepareTransactionRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Successfully prepared hash for signing",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPrepareTransactionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/active_contracts": {
          "get": {
            "operationId": "CantonApiController_getActiveContracts",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              },
              {
                "name": "templateIds",
                "required": false,
                "in": "query",
                "description": "An array of template IDs to filter the contracts.",
                "schema": {
                  "example": [
                    "#splice-amulet:Splice.Amulet:Amulet"
                  ],
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Retrieves user active contracts with optional filtering by template IDs.",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "example": [
                        {
                          "workflowId": "canton-network-acs-import-5-9",
                          "contractEntry": {
                            "JsActiveContract": {
                              "createdEvent": {
                                "offset": 19543,
                                "nodeId": 0,
                                "contractId": "006621408b9472ec257bd63235bb30e946b798237bb46c233cc2ad44beadf5bc2dca111220539bdc67bfcb0665f5275bc25b79115c0f0bab801549b7a111439f1e355168c2",
                                "templateId": "3ca1343ab26b453d38c8adb70dca5f1ead8440c42b59b68f070786955cbf9ec1:Splice.Amulet:Amulet",
                                "contractKey": null,
                                "createArgument": {
                                  "dso": "DSO::1220be58c29e65de40bf273be1dc2b266d43a9a002ea5b18955aeef7aac881bb471a",
                                  "owner": "my-extrernal-party-333::1220ca1d2a302e6b2969a6cf47e70d3ea80fc5c9fa3d01828516ac935fb0b585b6a2",
                                  "amount": {
                                    "initialAmount": "2319133546.0000000000",
                                    "createdAt": {
                                      "number": "17719"
                                    },
                                    "ratePerRound": {
                                      "rate": "0.0001268393"
                                    }
                                  }
                                },
                                "createdEventBlob": "",
                                "interfaceViews": [],
                                "witnessParties": [
                                  "my-extrernal-party-333::1220ca1d2a302e6b2969a6cf47e70d3ea80fc5c9fa3d01828516ac935fb0b585b6a2"
                                ],
                                "signatories": [
                                  "DSO::1220be58c29e65de40bf273be1dc2b266d43a9a002ea5b18955aeef7aac881bb471a",
                                  "my-extrernal-party-333::1220ca1d2a302e6b2969a6cf47e70d3ea80fc5c9fa3d01828516ac935fb0b585b6a2"
                                ],
                                "observers": [],
                                "createdAt": "2025-11-05T20:25:33.823437Z",
                                "packageName": "splice-amulet",
                                "representativePackageId": "3ca1343ab26b453d38c8adb70dca5f1ead8440c42b59b68f070786955cbf9ec1",
                                "acsDelta": true
                              },
                              "synchronizerId": "global-domain::1220be58c29e65de40bf273be1dc2b266d43a9a002ea5b18955aeef7aac881bb471a",
                              "reassignmentCounter": 0
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/me": {
          "get": {
            "operationId": "CantonApiController_me",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Get current user party information",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonPartyInfoDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/canton/api/query_completion": {
          "get": {
            "operationId": "CantonApiController_queryCompletion",
            "parameters": [
              {
                "name": "X-Canton-Node-Id",
                "in": "header",
                "description": "Canton node identifier to use for this request",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": [
                    "devnet-0",
                    "devnet-supa",
                    "mainnet-supa"
                  ],
                  "default": "devnet-0"
                }
              },
              {
                "name": "submissionId",
                "required": true,
                "in": "query",
                "description": "Submission ID to query completion status",
                "schema": {
                  "example": "submission-123",
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Query completion status",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonQueryCompletionResponseDto"
                    }
                  }
                }
              },
              "400": {
                "description": "Canton-specific error occurred",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/CantonErrorResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "tags": [
              "Canton"
            ]
          }
        },
        "/supa_points/balance": {
          "get": {
            "operationId": "SupaPointsController_getBalance",
            "parameters": [],
            "responses": {
              "200": {
                "description": "Returns current user balance",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/SupaPointsBalanceResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "summary": "Get current SupaPoints balance",
            "tags": [
              "SupaPoints"
            ]
          }
        },
        "/supa_points/history": {
          "get": {
            "operationId": "SupaPointsController_getHistory",
            "parameters": [
              {
                "name": "limit",
                "required": false,
                "in": "query",
                "min": 1,
                "max": 100,
                "int": true,
                "schema": {
                  "default": 10,
                  "type": "number"
                }
              },
              {
                "name": "page",
                "required": false,
                "in": "query",
                "min": 1,
                "int": true,
                "schema": {
                  "default": 1,
                  "type": "number"
                }
              },
              {
                "name": "order",
                "required": false,
                "in": "query",
                "schema": {
                  "$ref": "#/components/schemas/Order"
                }
              },
              {
                "name": "startDate",
                "required": false,
                "in": "query",
                "description": "Start timestamp of the period",
                "schema": {
                  "example": 1746103567002,
                  "type": "string"
                }
              },
              {
                "name": "endDate",
                "required": false,
                "in": "query",
                "description": "End timestamp of the period",
                "schema": {
                  "example": 1746183567002,
                  "type": "string"
                }
              },
              {
                "name": "action",
                "required": false,
                "in": "query",
                "description": "Action",
                "schema": {
                  "example": "DAILY_LOGIN",
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Returns SupaPoints operations history",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/OffsetPaginatedDto"
                      }
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "summary": "Get SupaPoints operations history",
            "tags": [
              "SupaPoints"
            ]
          }
        },
        "/supa_points/daily_login": {
          "post": {
            "operationId": "SupaPointsController_dailyLogin",
            "parameters": [],
            "responses": {
              "200": {
                "description": "Returns balance change and current user balance",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/DailyLoginResponseDto"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized"
              }
            },
            "security": [
              {
                "bearer": []
              }
            ],
            "summary": "Process daily login",
            "tags": [
              "SupaPoints"
            ]
          }
        },
        "/paymaster": {
          "post": {
            "operationId": "PaymasterController_paymaster",
            "parameters": [],
            "requestBody": {
              "required": true,
              "description": "New dialog params",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaymasterRequestDto"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "Can paymaster sponsor user operation",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/PaymasterResponseDto"
                    }
                  }
                }
              }
            },
            "tags": [
              "PayMaster"
            ]
          }
        }
      },
      "info": {
        "title": "Walletino - Backend",
        "description": "Walletino - Backend description",
        "version": "1.1.3",
        "contact": {}
      },
      "tags": [
        {
          "name": "Messages",
          "description": ""
        },
        {
          "name": "User",
          "description": ""
        }
      ],
      "servers": [],
      "components": {
        "securitySchemes": {
          "bearer": {
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "type": "http"
          }
        },
        "schemas": {
          "CantonErrorResponseDto": {
            "type": "object",
            "properties": {
              "statusCode": {
                "type": "number",
                "example": 400,
                "description": "HTTP status code for Canton errors"
              },
              "message": {
                "type": "string",
                "example": "Canton wallet not found for the user. Please register a wallet first.",
                "description": "Error message describing what went wrong"
              },
              "error": {
                "type": "string",
                "example": "CantonWalletNotFoundError",
                "description": "Error type/name"
              },
              "timestamp": {
                "type": "string",
                "example": "2025-12-27T10:30:00.000Z",
                "description": "Timestamp when the error occurred"
              },
              "path": {
                "type": "string",
                "example": "/canton/api/me",
                "description": "Request path where the error occurred"
              }
            },
            "required": [
              "statusCode",
              "message",
              "error",
              "timestamp",
              "path"
            ]
          },
          "CantonPrepareRegisterRequestDto": {
            "type": "object",
            "properties": {
              "publicKey": {
                "type": "string",
                "description": "Base64 stellar public key from privy"
              }
            },
            "required": [
              "publicKey"
            ]
          },
          "CantonPrepareTransactionResponseDto": {
            "type": "object",
            "properties": {
              "hash": {
                "type": "string",
                "description": "Base64 hash to be signed by the user"
              }
            },
            "required": [
              "hash"
            ]
          },
          "CantonSubmitRegisterRequestDto": {
            "type": "object",
            "properties": {
              "hash": {
                "type": "string",
                "description": "Base64 hash provided for signing"
              },
              "signature": {
                "type": "string",
                "description": "Base64 signature for provided hash"
              }
            },
            "required": [
              "hash",
              "signature"
            ]
          },
          "CantonPartyInfoDto": {
            "type": "object",
            "properties": {
              "partyId": {
                "type": "string",
                "description": "The unique identifier of the registered external party",
                "example": "my-external-party::1220ca1d2a302e6b2969a6cf47e70d3ea80fc5c9fa3d01828516ac935fb0b585b6a2"
              },
              "email": {
                "type": "string",
                "description": "Email address of the user",
                "example": "user@example.com",
                "nullable": true
              },
              "transferPreapprovalSet": {
                "type": "boolean",
                "description": "Indicates whether the transfer preapproval is set and NOT EXPIRED for the party",
                "example": true
              }
            },
            "required": [
              "partyId",
              "transferPreapprovalSet"
            ]
          },
          "NewDialogRequestDto": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string"
              }
            },
            "required": [
              "text"
            ]
          },
          "MessageResponseDto": {
            "type": "object",
            "properties": {
              "id": {
                "type": "number"
              },
              "dialogId": {
                "type": "number"
              },
              "text": {
                "type": "string"
              },
              "isReply": {
                "type": "boolean"
              },
              "date": {
                "format": "date-time",
                "type": "string"
              },
              "command": {
                "type": "object",
                "nullable": true
              },
              "payload": {
                "type": "object",
                "nullable": true
              },
              "actionSuggestions": {
                "type": "object",
                "nullable": true
              }
            },
            "required": [
              "id",
              "dialogId",
              "text",
              "isReply",
              "date"
            ]
          },
          "DialogWithMessagesResponseDto": {
            "type": "object",
            "properties": {
              "id": {
                "type": "number"
              },
              "createdAt": {
                "format": "date-time",
                "type": "string"
              },
              "updatedAt": {
                "format": "date-time",
                "type": "string"
              },
              "isProcessingNow": {
                "type": "boolean"
              },
              "messages": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/MessageResponseDto"
                }
              }
            },
            "required": [
              "id",
              "createdAt",
              "updatedAt",
              "isProcessingNow",
              "messages"
            ]
          },
          "Order": {
            "type": "string",
            "enum": [
              "ASC",
              "DESC"
            ]
          },
          "OffsetPaginationDto": {
            "type": "object",
            "properties": {
              "limit": {
                "type": "number"
              },
              "currentPage": {
                "type": "number"
              }
            },
            "required": [
              "limit",
              "currentPage"
            ]
          },
          "OffsetPaginatedDto": {
            "type": "object",
            "properties": {
              "data": {
                "type": "array",
                "items": {
                  "type": "object"
                }
              },
              "pagination": {
                "$ref": "#/components/schemas/OffsetPaginationDto"
              }
            },
            "required": [
              "data",
              "pagination"
            ]
          },
          "DialogListResponseDto": {
            "type": "object",
            "properties": {
              "id": {
                "type": "number"
              },
              "createdAt": {
                "format": "date-time",
                "type": "string"
              },
              "updatedAt": {
                "format": "date-time",
                "type": "string"
              },
              "isProcessingNow": {
                "type": "boolean"
              },
              "firstMessage": {
                "type": "string"
              }
            },
            "required": [
              "id",
              "createdAt",
              "updatedAt",
              "isProcessingNow",
              "firstMessage"
            ]
          },
          "NewMessageRequestDto": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string",
                "description": "Message text content",
                "example": "Hello, how can I help you?"
              }
            },
            "required": [
              "text"
            ]
          },
          "UserResponseDto": {
            "type": "object",
            "properties": {}
          },
          "UserBalanceEntryDto": {
            "type": "object",
            "properties": {
              "contractAddress": {
                "type": "string",
                "description": "Token contract address"
              },
              "tokenBalance": {
                "type": "string",
                "description": "Token balance as a big integer string"
              },
              "tokenBalanceDecimal": {
                "type": "string",
                "description": "Token balance as a human-readable decimal string"
              },
              "decimals": {
                "type": "number",
                "description": "Token decimals"
              },
              "logoUrl": {
                "type": "string",
                "description": "Token logo URL"
              },
              "name": {
                "type": "string",
                "description": "Token name"
              },
              "symbol": {
                "type": "string",
                "description": "Token symbol"
              },
              "network": {
                "type": "string",
                "description": "Network name"
              }
            },
            "required": [
              "contractAddress",
              "tokenBalance",
              "tokenBalanceDecimal",
              "decimals",
              "logoUrl",
              "name",
              "symbol",
              "network"
            ]
          },
          "UserBalanceResponseDto": {
            "type": "object",
            "properties": {
              "address": {
                "type": "string",
                "description": "Wallet address"
              },
              "balances": {
                "description": "List of token balances",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/UserBalanceEntryDto"
                }
              },
              "totalUsdBalance": {
                "type": "string",
                "description": "Total USD balance. Decimal string"
              }
            },
            "required": [
              "address",
              "balances",
              "totalUsdBalance"
            ]
          },
          "GetPricesByAddressesBodyDto": {
            "type": "object",
            "properties": {
              "addresses": {
                "description": "Array of pairs of alchemy network and contract address",
                "example": "[{\"network\": \"eth-mainnet\", \"contractAddress\": \"0x123\"}, {\"network\": \"eth-mainnet\", \"contractAddress\": \"0x456\"}]",
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "required": [
              "addresses"
            ]
          },
          "NetworkAddressAndPriceDto": {
            "type": "object",
            "properties": {
              "network": {
                "type": "string",
                "description": "Alchemy network",
                "example": "eth-mainnet"
              },
              "contractAddress": {
                "type": "string",
                "description": "Contract address",
                "example": "0x123"
              },
              "price": {
                "type": "number",
                "description": "USD price",
                "example": 1000
              }
            },
            "required": [
              "network",
              "contractAddress",
              "price"
            ]
          },
          "GetTokens24hrPriceChangeParams": {
            "type": "object",
            "properties": {
              "tokens": {
                "description": "Array of pairs of alchemy network and contract address",
                "example": "[{\"network\": \"eth-mainnet\", \"contractAddress\": \"0x123\"}, {\"network\": \"eth-mainnet\", \"contractAddress\": \"0x456\"}]",
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "required": [
              "tokens"
            ]
          },
          "TokenInfoWithPriceChangeDto": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Token name",
                "example": "Bitcoin"
              },
              "symbol": {
                "type": "string",
                "description": "Token symbol",
                "example": "BTC"
              },
              "logo": {
                "type": "string",
                "description": "Token logo",
                "example": "https://bitcoin.org/img/icons/icon-512x512.png?1746032784"
              },
              "description": {
                "type": "object",
                "description": "Token description",
                "example": "Bitcoin is a digital currency that is a decentralized, peer-to-peer payment system.",
                "nullable": true
              },
              "decimals": {
                "type": "number",
                "description": "decimals",
                "example": 8
              },
              "contractAddress": {
                "type": "string",
                "description": "contract address",
                "example": "0x0000000000000000000000000000000000000000"
              },
              "network": {
                "type": "string",
                "description": "network",
                "example": "ethereum"
              },
              "native": {
                "type": "boolean",
                "description": "native",
                "example": false
              },
              "priceChange": {
                "type": "object",
                "description": "Price change",
                "example": {
                  "currentPrice": 100.24,
                  "oldPrice": 100.23,
                  "priceChangeAbsolute": 0.01,
                  "priceChangePercentage": 1
                }
              }
            },
            "required": [
              "name",
              "symbol",
              "logo",
              "description",
              "decimals",
              "contractAddress",
              "network",
              "native",
              "priceChange"
            ]
          },
          "CantonPrepareTapRequestDto": {
            "type": "object",
            "properties": {
              "amount": {
                "type": "string",
                "description": "Positive integer or float amount of how many canton coins to receive. maximum 10 decimal points"
              }
            },
            "required": [
              "amount"
            ]
          },
          "CantonSubmitTransactionResponseDto": {
            "type": "object",
            "properties": {
              "submissionId": {
                "type": "string",
                "description": "submission id"
              }
            },
            "required": [
              "submissionId"
            ]
          },
          "CantonAcceptCantaraOfferRequestDto": {
            "type": "object",
            "properties": {
              "subscriptionOfferTemplateId": {
                "type": "string",
                "description": "Template ID of the subscription offer contract (e.g., Cantara:SubscriptionOffer). This allows accepting offers from different providers, not just Cantara.",
                "example": "aacde7aaa13f543e05b42df11abcc55f9a593abed570c560bf4bfcc79c44e2a9:Cantara:SubscriptionOffer"
              }
            },
            "required": [
              "subscriptionOfferTemplateId"
            ]
          },
          "CantonInstrumentIdDto": {
            "type": "object",
            "properties": {
              "admin": {
                "type": "string",
                "description": "DSO party ID (instrument administrator)",
                "example": "DSO::1220b1431ef217342db44d516bb9befde802be7d8899637d290895fa58880f19accc"
              },
              "id": {
                "type": "string",
                "description": "Token identifier",
                "example": "Amulet"
              }
            },
            "required": [
              "admin",
              "id"
            ]
          },
          "CantonUtxoMetadataDto": {
            "type": "object",
            "properties": {
              "createdInRound": {
                "type": "string",
                "description": "Round number when the UTXO was created",
                "example": "77043"
              },
              "demurrageRate": {
                "type": "string",
                "description": "Demurrage rate per round (balance decrease rate for Canton Coin)",
                "example": "0.0001388124"
              }
            },
            "required": [
              "createdInRound",
              "demurrageRate"
            ]
          },
          "CantonUnlockedUtxoDto": {
            "type": "object",
            "properties": {
              "contractId": {
                "type": "string",
                "description": "Contract ID of the UTXO",
                "example": "000367c838d7297f41e56b43d4bbc320b212e71d54de9a7d1d239ae770e6154cc9ca121220069d130ccd3aa4e6336ff61ded6708c1b48640cc40207f804380b41ade732290"
              },
              "amount": {
                "type": "string",
                "description": "Amount as decimal string",
                "example": "41.5604762808"
              },
              "metadata": {
                "description": "UTXO metadata including creation info and demurrage rate",
                "allOf": [
                  {
                    "$ref": "#/components/schemas/CantonUtxoMetadataDto"
                  }
                ]
              }
            },
            "required": [
              "contractId",
              "amount",
              "metadata"
            ]
          },
          "CantonHoldingLockDto": {
            "type": "object",
            "properties": {
              "holders": {
                "description": "Party IDs holding the lock",
                "example": [
                  "auth0_007c689b657291598790daabbdca::1220d3016091c253f526645cce3a0633837b685da083bac4459dad63e61d5c97b5fa"
                ],
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "expiresAt": {
                "type": "object",
                "description": "Lock expiration timestamp (ISO 8601)",
                "example": "2026-02-01T09:52:27.7072Z",
                "nullable": true
              },
              "expiresAfter": {
                "type": "object",
                "description": "Relative expiration duration",
                "nullable": true
              },
              "context": {
                "type": "object",
                "description": "Context describing why the UTXO is locked",
                "example": "Subscription remaining deposit lock",
                "nullable": true
              }
            },
            "required": [
              "holders"
            ]
          },
          "CantonLockedUtxoDto": {
            "type": "object",
            "properties": {
              "contractId": {
                "type": "string",
                "description": "Contract ID of the locked UTXO",
                "example": "00b44f095045deb1447018a5c77c6b777b04377f039b10ba6f18f6c789203e424dca121220cbad1d5d5da94d4cb96c6180148d9106ec0e1d5a0ae8406f21f501583ad9d7ea"
              },
              "amount": {
                "type": "string",
                "description": "Locked amount as decimal string",
                "example": "101.2504679545"
              },
              "lock": {
                "description": "Lock information including holders, expiration, and context",
                "allOf": [
                  {
                    "$ref": "#/components/schemas/CantonHoldingLockDto"
                  }
                ]
              },
              "metadata": {
                "description": "UTXO metadata including creation info and demurrage rate",
                "allOf": [
                  {
                    "$ref": "#/components/schemas/CantonUtxoMetadataDto"
                  }
                ]
              }
            },
            "required": [
              "contractId",
              "amount",
              "lock",
              "metadata"
            ]
          },
          "CantonTokenBalanceDto": {
            "type": "object",
            "properties": {
              "instrumentId": {
                "description": "Unique identifier for this token type",
                "allOf": [
                  {
                    "$ref": "#/components/schemas/CantonInstrumentIdDto"
                  }
                ]
              },
              "totalUnlockedBalance": {
                "type": "string",
                "description": "Total unlocked balance as decimal string",
                "example": "66.9880680391"
              },
              "totalLockedBalance": {
                "type": "string",
                "description": "Total locked balance as decimal string",
                "example": "101.2504679545"
              },
              "totalBalance": {
                "type": "string",
                "description": "Total balance (unlocked + locked) as decimal string",
                "example": "168.2385359936"
              },
              "unlockedUtxoCount": {
                "type": "number",
                "description": "Number of unlocked UTXOs",
                "example": 2
              },
              "lockedUtxoCount": {
                "type": "number",
                "description": "Number of locked UTXOs",
                "example": 1
              },
              "unlockedUtxos": {
                "description": "List of unlocked UTXOs",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/CantonUnlockedUtxoDto"
                }
              },
              "lockedUtxos": {
                "description": "List of locked UTXOs",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/CantonLockedUtxoDto"
                }
              }
            },
            "required": [
              "instrumentId",
              "totalUnlockedBalance",
              "totalLockedBalance",
              "totalBalance",
              "unlockedUtxoCount",
              "lockedUtxoCount",
              "unlockedUtxos",
              "lockedUtxos"
            ]
          },
          "CantonWalletBalancesResponseDto": {
            "type": "object",
            "properties": {
              "partyId": {
                "type": "string",
                "description": "Party ID of the wallet owner",
                "example": "supa1::1220dbc0b9f866909cfaa341d1dc561ebaa7a0b4f5a74f903f5afd30d2122d901046"
              },
              "tokens": {
                "description": "Token balances grouped by instrument ID",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/CantonTokenBalanceDto"
                }
              },
              "fetchedAt": {
                "type": "string",
                "description": "Timestamp when balances were fetched (ISO 8601)",
                "example": "2026-01-02T12:00:00.000Z"
              }
            },
            "required": [
              "partyId",
              "tokens",
              "fetchedAt"
            ]
          },
          "CantonPrepareAmuletTransferRequestDto": {
            "type": "object",
            "properties": {
              "receiverPartyId": {
                "type": "string",
                "description": "Canton party ID of the receiver wallet",
                "example": "receiver-party::1220abc123..."
              },
              "amount": {
                "type": "string",
                "description": "Amount of Amulet to transfer (decimal string with max 10 decimal places)",
                "example": "100.5"
              },
              "memo": {
                "type": "string",
                "description": "Optional memo for the transfer",
                "example": "Payment for services"
              }
            },
            "required": [
              "receiverPartyId",
              "amount"
            ]
          },
          "CantonDisclosedContractDto": {
            "type": "object",
            "properties": {
              "templateId": {
                "type": "string",
                "description": "The template id of the contract. The identifier uses the package-id reference format.",
                "example": "3ca1343ab26b453d38c8adb70dca5f1ead8440c42b59b68f070786955cbf9ec1:Splice.Amulet:Amulet"
              },
              "contractId": {
                "type": "string",
                "description": "The contract id",
                "example": "006621408b9472ec257bd63235bb30e946b798237bb46c233cc2ad44beadf5bc2dca111220539bdc67bfcb0665f5275bc25b79115c0f0bab801549b7a111439f1e355168c2"
              },
              "createdEventBlob": {
                "type": "string",
                "description": "Opaque byte string containing the complete payload required by the Daml engine to reconstruct a contract not known to the receiving participant.",
                "example": "base64EncodedBlobString..."
              },
              "synchronizerId": {
                "type": "string",
                "description": "The ID of the synchronizer where the contract is currently assigned",
                "example": "global-domain::1220be58c29e65de40bf273be1dc2b266d43a9a002ea5b18955aeef7aac881bb471a"
              }
            },
            "required": [
              "contractId",
              "createdEventBlob",
              "synchronizerId"
            ]
          },
          "CantonPrepareTransactionRequestDto": {
            "type": "object",
            "properties": {
              "commands": {
                "type": "object",
                "description": "The commands to be executed. Can be a single command or an array of commands. Each command must be one of: ExerciseCommand, CreateCommand, or CreateAndExerciseCommand.",
                "example": [
                  {
                    "ExerciseCommand": {
                      "templateId": "3ca1343ab26b453d38c8adb70dca5f1ead8440c42b59b68f070786955cbf9ec1:Splice.Amulet:Amulet",
                      "contractId": "006621408b9472ec257bd63235bb30e946b798237bb46c233cc2ad44beadf5bc2dca111220539bdc67bfcb0665f5275bc25b79115c0f0bab801549b7a111439f1e355168c2",
                      "choice": "Amulet_Transfer",
                      "choiceArgument": {
                        "transfer": {
                          "sender": "party1",
                          "receiver": "party2",
                          "amount": "100"
                        }
                      }
                    }
                  }
                ]
              },
              "disclosedContracts": {
                "description": "Additional contracts used to resolve contract and contract key lookups. These contracts are not part of the active contract set but are required for command execution.",
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/CantonDisclosedContractDto"
                }
              }
            },
            "required": [
              "commands"
            ]
          },
          "CantonQueryCompletionResponseDto": {
            "type": "object",
            "properties": {
              "status": {
                "type": "string",
                "description": "Status of the completion query",
                "enum": [
                  "completed",
                  "unknown"
                ],
                "example": "completed"
              },
              "data": {
                "type": "object",
                "description": "Completion data if available",
                "nullable": true
              },
              "message": {
                "type": "string",
                "description": "Message explaining the status",
                "example": "Completion data found"
              }
            },
            "required": [
              "status"
            ]
          },
          "SupaPointsBalanceResponseDto": {
            "type": "object",
            "properties": {
              "balance": {
                "type": "number",
                "description": "Current SupaPoints balance",
                "example": 100
              }
            },
            "required": [
              "balance"
            ]
          },
          "DailyLoginResponseDto": {
            "type": "object",
            "properties": {
              "balance": {
                "type": "number",
                "description": "Current SupaPoints balance",
                "example": 100
              },
              "add": {
                "type": "number",
                "description": "SupaPoints balance change",
                "example": 10
              }
            },
            "required": [
              "balance",
              "add"
            ]
          },
          "PaymasterRequestDataDto": {
            "type": "object",
            "properties": {
              "userOperation": {
                "type": "string",
                "description": "User operation hex-string"
              },
              "entryPoint": {
                "type": "string",
                "description": "Entrypoint address"
              },
              "chainId": {
                "type": "number",
                "description": "Network ID"
              },
              "sponsorshipPolicyId": {
                "type": "string",
                "description": "Sponsorship policy ID"
              }
            },
            "required": [
              "userOperation",
              "entryPoint",
              "chainId",
              "sponsorshipPolicyId"
            ]
          },
          "PaymasterRequestDto": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "sponsorshipPolicy.webhook"
                ],
                "description": "Тип запроса"
              },
              "data": {
                "description": "Данные запроса",
                "allOf": [
                  {
                    "$ref": "#/components/schemas/PaymasterRequestDataDto"
                  }
                ]
              }
            },
            "required": [
              "type",
              "data"
            ]
          },
          "PaymasterResponseDto": {
            "type": "object",
            "properties": {
              "sponsor": {
                "type": "boolean"
              }
            },
            "required": [
              "sponsor"
            ]
          }
        }
      }
    },
    "customOptions": {}
  };
    url = options.swaggerUrl || url
    let urls = options.swaggerUrls
    let customOptions = options.customOptions
    let spec1 = options.swaggerDoc
    let swaggerOptions = {
      spec: spec1,
      url: url,
      urls: urls,
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout"
    }
    for (let attrname in customOptions) {
      swaggerOptions[attrname] = customOptions[attrname];
    }
    let ui = SwaggerUIBundle(swaggerOptions)
  
    if (customOptions.initOAuth) {
      ui.initOAuth(customOptions.initOAuth)
    }
  
    if (customOptions.authAction) {
      ui.authActions.authorize(customOptions.authAction)
    }
    
    window.ui = ui
  }
  