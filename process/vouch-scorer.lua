VOUCH_PROCESS = "ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo"
VOUCHER_WHITELIST = {
  ["Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8"] = true,
  ["k6p1MtqYhQQOuTSfN8gH7sQ78zlHavt8dCDL88btn9s"] = true,
  ["QeXDjjxcui7W2xU08zOlnFwBlbiID4sACpi0tSS3VgY"] = true,
  ["3y0YE11i21hpP8UY0Z1AVhtPoJD4V_AbEBx-g0j9wRc"] = true,
}

local json = require("json")

function GetVouchScoreUsd(walletId)
  ao.send({
    Target = VOUCH_PROCESS,
    Tags = {
      Action = "Get-Vouches",
      ID = walletId,
    }
  })

  local resp = Handlers.receive({
    From = VOUCH_PROCESS,
    Action = "VouchDAO.Vouches",
  })

  local success, data = pcall(json.decode, resp.Data)
  if not success or type(data) ~= 'table' or data['Vouchers'] == nil then
    print("Invalid data: " .. resp.Data)
    return 0
  end

  if data['Vouches-For'] ~= walletId then
    print("Vouches-For mismatch, expected: " .. walletId .. ", got: " .. tostring(data['Vouches-For']))
    return 0
  end

  local vouches = data['Vouchers']
  local score = 0

  for voucher, vouch in pairs(vouches) do
    if VOUCHER_WHITELIST[voucher] then
      -- 1.34-USD -> 1.34
      local valueStr = string.match(vouch.Value, "([%d%.]+)-USD")
      if valueStr ~= nil then
        score = score + tonumber(valueStr)
      end
    end
  end

  return score
end
