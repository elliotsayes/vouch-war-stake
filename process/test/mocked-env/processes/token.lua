local json = require "json"

local function newmodule(selfId)
  local token = {}

  local ao = require "ao" (selfId)

  token.mockBalance = "100"

  function token.handle(msg)
    print("[Token" .. selfId .. "]")
  end

  return token
end
return newmodule
