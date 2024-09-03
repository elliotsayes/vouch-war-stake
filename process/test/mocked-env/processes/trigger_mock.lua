local json = require "json"

local function newmodule(selfId)
  local trigger = {}

  local ao = require "ao" (selfId)

  function trigger.handle(msg)
    print("[Trigger]")
  end

  return trigger
end
return newmodule
