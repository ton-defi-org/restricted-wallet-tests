import { printChain, iTvmBusContract, ExecutionResult, iDeployableContract } from "../../ton-tvm-bus/src/index";
import { SmartContract } from "ton-contract-executor";
import { Address } from "ton";

const ZERO_ADDRESS = Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c");

export class Elector implements iTvmBusContract, iDeployableContract {
    private initTime: number = Date.now();
    public address: Address = ZERO_ADDRESS;
    initMessageResultRaw?: ExecutionResult;

    private constructor(public readonly contract: SmartContract, myAddress: Address) {
        this.contract.setC7Config({
            myself: myAddress,
        });
        this.address = myAddress;
    }
}
