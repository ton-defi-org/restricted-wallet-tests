import BN from "bn.js";
import { Address, beginCell, Cell, contractAddress, InternalMessage, toNano, ExternalMessage } from "ton";
import { SmartContract } from "ton-contract-executor";
import { compileFuncToB64 } from "./utils";
const ZERO_ADDRESS = Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");

export class RestrictedWallet {
    contract: SmartContract;
    address: Address;

    private constructor(contract: SmartContract, myAddress: Address, balance: BN) {
        this.contract = contract;
        this.address = myAddress;
        contract.setC7Config({
            balance: balance.toNumber(),
            myself: myAddress,
        });
    }

    async sendInternalMessage(message: InternalMessage) {
        //@ts-ignore
        return this.contract.sendInternalMessage(message);
    }

    async sendExternalMessage(message: ExternalMessage) {
        //@ts-ignore
        return this.contract.sendExternalMessage(message);
    }

    static getCode(): Cell[] {
        const jettonWalletCodeB64: string = compileFuncToB64(["contracts/stdlib.fc", "contracts/nonstdlib.fc", "contracts/restricted-wallet.fc"]);
        return Cell.fromBoc(jettonWalletCodeB64);
    }

    static async Create(balance = toNano(10), publicKey: Buffer, owner: Address, walletId = 0) {
        const codeCell = RestrictedWallet.getCode()[0];
        const dataCell = beginCell().storeUint(0, 32).storeUint(walletId, 32).storeBuffer(publicKey).storeAddress(owner).endCell();
        const contract = await SmartContract.fromCell(codeCell, dataCell, {
            getMethodsMutate: true,
            debug: true,
        });
        const myAddress = contractAddress({ workchain: 0, initialCode: codeCell, initialData: dataCell });
        return new RestrictedWallet(contract, myAddress, balance);
    }
}
