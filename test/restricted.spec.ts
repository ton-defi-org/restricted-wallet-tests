import { RestrictedWallet } from "../src/restricted-wallet";
import { KeyPair } from "ton-crypto";
import { toNano, ExternalMessage, Address, CommonMessageInfo, CellMessage, beginCell, createWalletTransferV3, Cell, InternalMessage } from "ton";
import { BN } from "bn.js";
import { expect } from "chai";
import { filterLogs, initDeployKey } from "../src/utils";

const elector = Address.parse("Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF");
const alice = Address.parse("EQCLjyIQ9bF5t9h3oczEX3hPVK4tpW2Dqby0eHOH1y5_Nvb7");
const bob = Address.parse("EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnbdLIYI");

const misha = Address.parse("EQCbPJVt83Noxmg8Qw-Ut8HsZ1lz7lhp4k0v9mBX2BJewhpe");

const ElectorOps = {
    "0x4e73744b": 0x4e73744b,
    "0x47657424": 0x47657424,
    "0x52674370": 0x52674370,
    "0x56744370": 0x56744370,
};

describe("restricted wallet test suite", () => {
    let walletKeys: KeyPair;
    let wallet: RestrictedWallet;

    beforeEach(async () => {
        walletKeys = await initDeployKey();
        wallet = await RestrictedWallet.Create(toNano(10), walletKeys.publicKey, alice, 0);
    });

    it("send elector OP=0x4e73744b", async () => {
        let signedMessage = await sendSimpleOP("0x4e73744b", elector, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );

        expect(res.actionList.length).eq(1);
        expect(res.exit_code).eq(0);
    });

    it("send elector OP=0x47657424", async () => {
        let signedMessage = await sendSimpleOP("0x47657424", elector, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );
        expect(res.actionList.length).eq(1);
        expect(res.exit_code).eq(0);
    });

    it("send elector OP=0x52674370", async () => {
        let signedMessage = await sendSimpleOP("0x52674370", elector, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );
        expect(res.actionList.length).eq(1);
        expect(res.exit_code).eq(0);
    });

    it("send elector OP=0x56744370", async () => {
        let signedMessage = await sendSimpleOP("0x56744370", elector, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );
        expect(res.actionList.length).eq(1);
        expect(res.exit_code).eq(0);
    });

    it("send to elector  bad opp", async () => {
        let signedMessage = await sendSimpleOP("787", elector, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );

        expect(res.actionList.length).eq(0);
        expect(res.exit_code).eq(39);
    });

    it("send bad owner and fail", async () => {
        let signedMessage = await sendSimpleOP("0x56744370", bob, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );

        expect(res.actionList.length).eq(0);
        expect(res.exit_code).eq(39);
    });

    it("test withdraw owner", async () => {
        let signedMessage = await sendSimpleOP("0x56744370", alice, walletKeys.secretKey);
        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );

        expect(res.actionList.length).eq(1);
        expect(res.exit_code).eq(0);
    });

    it("send elector empty body and fail", async () => {
        let signedMessage = createWalletTransferV3({
            seqno: 0,
            sendMode: 1,
            walletId: 0,
            secretKey: walletKeys.secretKey,
            order: new InternalMessage({
                to: elector,
                value: toNano(0.25),
                bounce: false,
                body: new CommonMessageInfo({ body: new CellMessage(beginCell().endCell()) }),
            }),
        });

        let res = await wallet.sendExternalMessage(
            new ExternalMessage({
                to: wallet.address,
                body: new CommonMessageInfo({
                    body: new CellMessage(signedMessage),
                }),
            })
        );
        expect(res.actionList.length).eq(0);
        expect(res.type).eq("failed");
    });
});

async function sendSimpleOP(op: string, to: Address, secretKey: Buffer) {
    const inMessage = beginCell().storeUint(Number(op), 32).storeUint(1, 64).endCell();
    const MODE = 1;
    //let messageToSign = beginCell().storeRef(inMessage).endCell();

    let signedMessage = createWalletTransferV3({
        seqno: 0,
        sendMode: MODE,
        walletId: 0,
        secretKey: secretKey,
        order: new InternalMessage({
            to,
            value: toNano(0.25),
            bounce: false,
            body: new CommonMessageInfo({ body: new CellMessage(inMessage) }),
        }),
    });
    return signedMessage;
}
