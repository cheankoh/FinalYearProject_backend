import axios from 'axios';


export const getAllAuctions = async () => {
    var config = {
        method: 'get',
        url: 'https://dapp-incentivising-daily-steps.herokuapp.com/api/auction/getAllAuctions',
        headers: {}
    };

    try {
        const { auctionList } = await axios(config);
        let nftQueryData = []
        auctionList.auctions.forEach(auction => {
            nftQueryData.push(auction.nft_id);
        })

        config = {
            method: 'get',
            url: 'https://dapp-incentivising-daily-steps.herokuapp.com/api/auction/getAllAuctionsNft',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: { nftIds: nftQueryData }
        };

        const { nftList } = await axios(config);
        console.log(nftList)
        return nftList;
    } catch (error) {
        console.log(error.message);
    }
};

