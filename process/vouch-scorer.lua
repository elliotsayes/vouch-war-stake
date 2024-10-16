VOUCH_PROCESS = "ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo"
VOUCHER_WHITELIST = {
  -- Vouch-X
  ["Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8"] = true,
  -- Vouch-Gitcoin-Passport
  ["k6p1MtqYhQQOuTSfN8gH7sQ78zlHavt8dCDL88btn9s"] = true,
  -- Vouch-AO-Balance
  ["QeXDjjxcui7W2xU08zOlnFwBlbiID4sACpi0tSS3VgY"] = true,
  -- Vouch-wAR-Stake
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
    ID = walletId,
  })

  local success, data = pcall(json.decode, resp.Data)
  if not success or type(data) ~= 'table' then
    print("Invalid data: " .. resp.Data)
    return 0
  end

  local vouches = data['Vouchers']
  if vouches == nil then
    print("No Vouchers")
    return 0
  end

  local score = 0
  for voucher, vouch in pairs(vouches) do
    if VOUCHER_WHITELIST[voucher] then
      local vouchFor = vouch['Vouch-For']
      if vouchFor ~= walletId then
        print(voucher .. " has Vouch-For mismatch, expected: " .. walletId .. ", got: " .. vouchFor)
      else
        -- 1.34-USD -> 1.34
        local valueStr = string.match(vouch.Value, "([%d%.]+)-USD")
        local value = tonumber(valueStr)
        if valueStr == nil or value == nil then
          print(voucher .. " has invalid value: " .. vouch.Value)
        else
          score = score + value
        end
      end
    end
  end

  return score
end
