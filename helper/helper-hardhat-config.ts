
type ConfigType = {
    [x: number]: {
        name: string,
        ethToUsd: string
        blockConfirmations?: number
    }
}

export const DevelopmentChains = ["hardhat", "localhost"]

export const DECIMALS = 8
export const INITIAL_ANSWER = 1000000000000

export const networkConfig: ConfigType = {
    11155111: {
        name: "sepolia",
        ethToUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        blockConfirmations: 6,
    },
    31337: {
        name: "hardhat",
        ethToUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    1337: {
        name: "localhost",
        ethToUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    5777: {
        name: "localhost",
        ethToUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}