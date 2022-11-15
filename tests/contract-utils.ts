import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  LogFlashloan,
  updateOwnerLog,
  updateWhitelistLog
} from "../generated/Contract/Contract"

export function createLogFlashloanEvent(
  account: Address,
  route: BigInt,
  tokens: Array<Address>,
  amounts: Array<BigInt>
): LogFlashloan {
  let logFlashloanEvent = changetype<LogFlashloan>(newMockEvent())

  logFlashloanEvent.parameters = new Array()

  logFlashloanEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  logFlashloanEvent.parameters.push(
    new ethereum.EventParam("route", ethereum.Value.fromUnsignedBigInt(route))
  )
  logFlashloanEvent.parameters.push(
    new ethereum.EventParam("tokens", ethereum.Value.fromAddressArray(tokens))
  )
  logFlashloanEvent.parameters.push(
    new ethereum.EventParam(
      "amounts",
      ethereum.Value.fromUnsignedBigIntArray(amounts)
    )
  )

  return logFlashloanEvent
}

export function createupdateOwnerLogEvent(
  oldOwner: Address,
  newOwner: Address
): updateOwnerLog {
  let updateOwnerLogEvent = changetype<updateOwnerLog>(newMockEvent())

  updateOwnerLogEvent.parameters = new Array()

  updateOwnerLogEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  updateOwnerLogEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return updateOwnerLogEvent
}

export function createupdateWhitelistLogEvent(
  account: Address,
  isWhitelisted_: boolean
): updateWhitelistLog {
  let updateWhitelistLogEvent = changetype<updateWhitelistLog>(newMockEvent())

  updateWhitelistLogEvent.parameters = new Array()

  updateWhitelistLogEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  updateWhitelistLogEvent.parameters.push(
    new ethereum.EventParam(
      "isWhitelisted_",
      ethereum.Value.fromBoolean(isWhitelisted_)
    )
  )

  return updateWhitelistLogEvent
}
