import {lob} from "../../lib/LOB";
import {TransactionType} from "../../lib/lob/Transactions";
import {IssuanceID} from "../../lib/IssuanceID";
import {formatDate} from "../../lib/utils";
import {IssuanceInfo} from "../shared/issuanceInfo";
import {handleUnknownEthereumError} from "../../lib/ErrorHandling";
import {Etherscan} from "../../lib/Etherscan";
import {LicenseContractInfo} from "../shared/licenseContractInfo";

export const DisableLicenseContractTransactionInfo = {
    show(transactionHash) {
        EthElements.Modal.show({
            template: 'disableLicenseContractTransactionInfo',
            data: {transactionHash},
            class: 'mediumModal'
        });
    }
};

Template.disableLicenseContractTransactionInfo.helpers({
    licenseContract() {
        return lob.transactions.getTransaction(this.transactionHash).licenseContract;
    },
    from() {
        return lob.transactions.getTransaction(this.transactionHash).from;
    },
    transaction() {
        return lob.transactions.getTransaction(this.transactionHash);
    },
    etherscanUrl() {
        return Etherscan.getUrlForTransaction(this.transactionHash);
    }
});

Template.disableLicenseContractTransactionInfo.events({
    'click button.hideModal'() {
        EthElements.Modal.hide();
    },
    'click .showLicenseContractInfo'(event) {
        event.preventDefault();
        LicenseContractInfo.show(lob.transactions.getTransaction(this.transactionHash).licenseContract);
    }
});