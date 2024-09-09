local json = require("json")

_0RBIT = "BaMK1dfayo75s3q1ow6AO64UDpD9SEFbeE8xYrY2fyQ"
_0RBT_POINTS_PROCESS = "BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc"
FEE_AMOUNT = "1000000000000" -- 1 $0RBT

WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
VOUCHER_PROCESS = "VukxndIxBlR7qGEuIotb4YKWUFn6BMEjoWM4ln9COLw"
SUBSCRIBER_PROCESSES = {
  VOUCHER_PROCESS
}

function RequestData()
  local baseUrl = "https://api.coingecko.com/api/v3/simple/price"
  local ticker = "arweave"
  local currency = "usd"

  local finalURL = baseUrl .. "?ids=" .. ticker .. "&vs_currencies=" .. currency

  Send({
    Target = _0RBT_POINTS_PROCESS,
    Action = "Transfer",
    Recipient = _0RBIT,
    Quantity = FEE_AMOUNT,
    ["X-Url"] = finalURL,
    ["X-Action"] = "Get-Real-Data"
  })
end

function ReceiveData(msg)
  local res = json.decode(msg.Data)
  for k, v in pairs(res) do
    if (k == "arweave") then
      local priceUsd = tostring(v.usd)
      print("Price of Arweave: " .. priceUsd)
      for _, process in ipairs(SUBSCRIBER_PROCESSES) do
        Send({
          Target = process,
          Tags = {
            Action = "Price-Update",
            TokenId = WAR_TOKEN_PROCESS,
            Price = priceUsd,
            Currency = "USD"
          },
          Data = priceUsd
        })
      end
    else
      print("Unknown token: " .. k)
    end
  end
end

Handlers.add(
  "ReceiveData",
  Handlers.utils.hasMatchingTag("Action", "Receive-Response"),
  function(msg)
    if msg.From ~= _0RBIT then
      print("Unauthorised response from: " .. msg.From)
    end

    ReceiveData(msg)
  end
)

Handlers.add(
  "CronTick",
  function(msg)
    return msg.Cron == true
  end,
  RequestData
)
