local json = require "json"

local function newmodule(selfId)
  local voucher = {}

  local ao = require "ao" (selfId)

  function voucher.handle(msg)
    print("[Voucher]")
  end

  return voucher
end
return newmodule
