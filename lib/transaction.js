/* @flow
 * Transaction utilities and data structures
 */

import { Transaction, address as baddress } from 'bitcoinjs-lib';
import type { Output } from 'bitcoinjs-lib';
import {
    Map as ImmutableMap,
    Set as ImmutableSet
} from 'immutable';

export type TransactionInfoData = {
    txBin: string;
    id: string;
    outputAddresses: Array<?string>;
    height: ?number;
    timestamp: ?number;
};

export class TransactionInfo {
    tx: Transaction;
    id: string;
    height: ?number;
    timestamp: ?number;

    inputIds: Array<string>;
    outputAddresses: Array<?string>;

    constructor(
        tx: Transaction,
        id: string,
        outputAddresses: ?Array<?string>,
        height: ?number,
        timestamp: ?number
    ) {
        this.tx = tx;
        this.id = id;
        this.height = height;
        this.timestamp = timestamp;

        let inputIds = [];
        tx.ins.forEach((input) => {
            let hash = input.hash;
            Array.prototype.reverse.call(hash);
            inputIds.push(hash.toString('hex'));
            Array.prototype.reverse.call(hash);
        });
        this.inputIds = inputIds;

        if (outputAddresses == null) {
            let _outputAddresses = [];
            tx.outs.forEach((output) => {
                let address;
                try {
                    address = baddress.fromOutputScript(output.script);
                } catch (e) {
                    console.warn('Error while parsing output script', e);
                    address = null;
                }
                _outputAddresses.push(address);
            });
            this.outputAddresses = _outputAddresses;
        } else {
            this.outputAddresses = outputAddresses;
        }
    }

    static fromJSON(data: TransactionInfoData): TransactionInfo {
        let tx = Transaction.fromBuffer(new Buffer(data.txBin, 'binary'));

        return new TransactionInfo(
            tx,
            data.id,
            data.outputAddresses,
            data.height,
            data.timestamp
        );
    }

    toJSON(): TransactionInfoData {
        return {
            txBin: this.tx.toBuffer().toString('binary'),
            id: this.id,
            outputAddresses: this.outputAddresses,
            height: this.height,
            timestamp: this.timestamp,
        };
    }
}

export type TransactionMapData = Array<TransactionInfoData>;

export type TransactionMap = ImmutableMap<string, TransactionInfo>;

export function getOutput(transactions: TransactionMap, id: string, i: number): ?Output {
    let t = transactions.get(id);
    if (t) {
        return t.tx.outs[i];
    }
}
