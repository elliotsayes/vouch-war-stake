local json = require "json"

local function newmodule(selfId)
  local dummy = {}

  function dummy.handle(msg)
    print("[Dummy " .. selfId .. "]")
  end

  return dummy
end
return newmodule
