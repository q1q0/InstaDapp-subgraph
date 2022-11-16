import { BigInt, Bytes, Address, ethereum, log } from "@graphprotocol/graph-ts";
import {
  LogFlashloan,
  updateOwnerLog,
  updateWhitelistLog,
} from "../generated/Contract/Contract";
import { Flashloan, Amount } from "../generated/schema";
import TokenList from "./config";

function loadAmount(id: Bytes): Amount {
  let amount = Amount.load(id);
  if (!amount) {
    amount = new Amount(id);
    amount.vol = new BigInt(0);
    amount.fee = new BigInt(0);
  }
  return amount;
}

function getAmountFromTokenInFlashloan(
  amountList: BigInt[],
  tokenList: Address[],
  filterToken: string
): BigInt {
  let len = tokenList.length;
  let res = new BigInt(0);
  for (let i = 0; i < len; i++) {
    if (tokenList[i].equals(Address.fromHexString(filterToken))) {
      res = amountList[i];
      break;
    }
  }

  return res;
}

export function handleLogFlashloan(event: LogFlashloan): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = Flashloan.load(event.params.account);

  if (!entity) {
    entity = new Flashloan(event.params.account);
  }

  entity.account = event.params.account;
  let usdcvol = new BigInt(0);
  let wethvol = new BigInt(0);
  let usdtvol = new BigInt(0);
  let daivol = new BigInt(0);

  let usdcfee = new BigInt(0);
  let wethfee = new BigInt(0);
  let usdtfee = new BigInt(0);
  let daifee = new BigInt(0);

  let usdcAddr: string = TokenList.main.usdc.address;
  let wethAddr: string = TokenList.main.weth.address;
  let usdtAddr: string = TokenList.main.usdt.address;
  let daiAddr: string = TokenList.main.dai.address;
  let usdcAmount = loadAmount(
    event.params.account.concat(Bytes.fromHexString(usdcAddr))
  );
  let wethAmount = loadAmount(
    event.params.account.concat(Bytes.fromHexString(wethAddr))
  );
  let usdtAmount = loadAmount(
    event.params.account.concat(Bytes.fromHexString(usdtAddr))
  );
  let daiAmount = loadAmount(
    event.params.account.concat(Bytes.fromHexString(daiAddr))
  );

  for (let i = 0; i < event.params.tokens.length; i++) {
    if (event.params.tokens[i].equals(Address.fromHexString(usdcAddr))) {
      usdcvol = event.params.amounts[i];
    }
    if (event.params.tokens[i].equals(Address.fromHexString(wethAddr))) {
      wethvol = event.params.amounts[i];
    }
    if (event.params.tokens[i].equals(Address.fromHexString(usdtAddr))) {
      usdtvol = event.params.amounts[i];
    }
    if (event.params.tokens[i].equals(Address.fromHexString(daiAddr))) {
      daivol = event.params.amounts[i];
    }
  }

  let receipt = event.receipt;

  const TRANSFERTOPIC =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  if (receipt) {
    let tx = receipt.logs;
    if (tx) {
      let length = tx.length;
      for (let i = 0; i < length; i++) {
        let topics = tx[i].topics;

        if (topics[0].equals(Bytes.fromHexString(TRANSFERTOPIC))) {
          let topic2 = ethereum.decode("address", topics[2])!;
          let data = ethereum.decode("uint256", tx[i].data)!;
          let topic1 = ethereum.decode("address", topics[1])!;
          if (
            topic2
              .toAddress()
              .equals(Address.fromHexString(TokenList.main.InstaFlashAggregator))
          ) {
            if (
              tx[i].address.equals(
                Address.fromHexString(TokenList.main.usdc.address)
              ) &&
              topic1.toAddress().equals(event.params.account)
            ) {
              usdcfee = data.toBigInt().minus(getAmountFromTokenInFlashloan(event.params.amounts, event.params.tokens, TokenList.main.usdc.address));
            } else if (
              tx[i].address.equals(
                Address.fromHexString(TokenList.main.weth.address)
              ) &&
              topic1.toAddress().equals(event.params.account)
            ) {
              wethfee = data.toBigInt().minus(getAmountFromTokenInFlashloan(event.params.amounts, event.params.tokens, TokenList.main.weth.address));
            } else if (
              tx[i].address.equals(
                Address.fromHexString(TokenList.main.usdt.address)
              ) &&
              topic1.toAddress().equals(event.params.account)
            ) {
              usdtfee = data.toBigInt().minus(getAmountFromTokenInFlashloan(event.params.amounts, event.params.tokens, TokenList.main.usdt.address));
            } else if (
              tx[i].address.equals(
                Address.fromHexString(TokenList.main.dai.address)
              ) &&
              topic1.toAddress().equals(event.params.account)
            ) {
              daifee = data.toBigInt().minus(getAmountFromTokenInFlashloan(event.params.amounts, event.params.tokens, TokenList.main.dai.address));
            }
          }
        }
      }
    }
  }

  let volUSDC = usdcAmount.vol!;
  let volUSDT = usdtAmount.vol!;
  let volWETH = wethAmount.vol!;
  let volDAI = daiAmount.vol!;

  let feeUSDC = usdcAmount.fee!;
  let feeUSDT = usdtAmount.fee!;
  let feeWETH = wethAmount.fee!;
  let feeDAI = daiAmount.fee!;

  usdcAmount.vol = volUSDC.plus(usdcvol);
  wethAmount.vol = volWETH.plus(wethvol);
  usdtAmount.vol = volUSDT.plus(usdtvol);
  daiAmount.vol = volDAI.plus(daivol);

  usdcAmount.fee = feeUSDC.plus(usdcfee);
  wethAmount.fee = feeWETH.plus(wethfee);
  usdtAmount.fee = feeUSDT.plus(usdtfee);
  daiAmount.fee = feeDAI.plus(daifee);

  usdcAmount.save();
  wethAmount.save();
  usdtAmount.save();
  daiAmount.save();

  entity.usdc = event.params.account.concat(Bytes.fromHexString(usdcAddr));
  entity.eth = event.params.account.concat(Bytes.fromHexString(wethAddr));
  entity.usdt = event.params.account.concat(Bytes.fromHexString(usdtAddr));
  entity.dai = event.params.account.concat(Bytes.fromHexString(daiAddr));
  entity.save();

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
