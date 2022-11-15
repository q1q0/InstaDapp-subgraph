import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  Contract,
  LogFlashloan,
  updateOwnerLog,
  updateWhitelistLog
} from "../generated/Contract/Contract"
import { Flashloan, Amount, Log } from "../generated/schema"
import TokenList from "./config"

function getAmount(id : Bytes): Amount {
  let amount = Amount.load(id)
  if(!amount) {
    amount = new Amount(id)
    amount.vol = new BigInt(0)
  }
  return amount;
}

export function handleLogFlashloan(event: LogFlashloan): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Flashloan.load(event.params.account);

  if(!entity) {
    entity = new Flashloan( event.params.account)
  }

  entity.account = event.params.account
  let usdcvol = new BigInt(0);
  let wethvol = new BigInt(0);
  let usdcAddr: string = TokenList.main.usdc.address
  let wethAddr: string = TokenList.main.weth.address
  let usdcAmount = getAmount(event.params.account.concat(Bytes.fromHexString(usdcAddr)))
  let wethAmount = getAmount(event.params.account.concat(Bytes.fromHexString(wethAddr)))

  for(let i = 0; i < event.params.tokens.length; i++) {
    if (event.params.tokens[i].equals(Bytes.fromHexString(usdcAddr))) {
      usdcvol = usdcvol.plus(event.params.amounts[i].div(BigInt.fromU32(10).pow(TokenList.main.usdc.decimal)))
    }
    if (event.params.tokens[i].equals(Bytes.fromHexString(wethAddr))) {
      wethvol = wethvol.plus(event.params.amounts[i].div(BigInt.fromU32(10).pow(TokenList.main.weth.decimal)))
    }
  }

  usdcAmount.vol = usdcvol;
  wethAmount.vol = wethvol;
  usdcAmount.save()
  wethAmount.save()
  
  entity.usdc = event.params.account.concat(Bytes.fromHexString(usdcAddr));
  entity.eth = event.params.account.concat(Bytes.fromHexString(wethAddr));

  let receipt = event.receipt

  const TRANSFERTOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

  if(receipt) {
    let tx = receipt.logs;
    if(tx) {
      let length = tx.length
      const ids: Bytes[] = []
      for(let i = 0; i < length; i++) {
        const id = receipt.blockHash.concat(Bytes.fromByteArray(Bytes.fromU64(i)))
        let logEntity = Log.load(id);
        if(!logEntity) {
          logEntity = new Log(id)
        }
        logEntity.blockHash = tx[i].blockHash
        logEntity.address = tx[i].address
        logEntity.topics = tx[i].topics
        logEntity.data = tx[i].data
        logEntity.logType = tx[i].logType
        logEntity.transactionLogIndex = tx[i].transactionLogIndex
        logEntity.logIndex = tx[i].logIndex
        logEntity.transactionHash = tx[i].transactionHash
        logEntity.blockNumber = tx[i].blockNumber
        logEntity.save()
        ids.push(id)

        let topics = tx[i].topics;
        if(topics[0].equals(Bytes.fromHexString(TRANSFERTOPIC))) {
          
        }
      }
      entity.logs = ids;
    }
  }

  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.InstaFeeBPS(...)
  // - contract.calculateFeeBPS(...)
  // - contract.executeOperation(...)
  // - contract.getRoutes(...)
  // - contract.isWhitelisted(...)
  // - contract.onFlashLoan(...)
  // - contract.owner(...)
  // - contract.tokenToCToken(...)
}

export function handleupdateOwnerLog(event: updateOwnerLog): void {}

export function handleupdateWhitelistLog(event: updateWhitelistLog): void {}
