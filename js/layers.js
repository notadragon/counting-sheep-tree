
addLayer("s", {
    name: "Sheep", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "sheep", // Name of prestige currency
    baseResource: "Sheep Fragments", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for sheep", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    tabFormat: [
        "main-display",
        "resource-display",
        "blank",
        "buyables",
        "milestones",
        "upgrades"
    ],

    getResetGain() {
        return new Decimal(1)
    },

    sheepPerCount() {
        output = new Decimal(1)

        if (hasUpgrade('s', 11)) { output = output.add(1) }
        if (hasUpgrade('s', 12)) { output = output.add(3) }
        if (hasUpgrade('s', 13)) { output = output.add(2) }
        if (hasMilestone('s', 0)) { output = output.add(10) }
        if (hasMilestone('s', 1)) { output = output.add(7) }
        if (hasUpgrade('s', 15)) { output = output.add(36) }
        if (hasUpgrade('s',21) && !hasUpgrade('s',22)) { output = output.times(2) }
        if (hasUpgrade('s',22)) { output = output.times(4) }
        if (hasUpgrade('s',23) && !hasMilestone('p',0)) { output = output.sub(10) }
        if (hasUpgrade('s',24)) { output = output.times(10) }
        if (hasUpgrade('s',25)) { output = output.times(2) }

        if (hasUpgrade('p',11)) { output = output.times(5) }
        if (hasUpgrade('p',12)) { output = output.times(10) }

        //output = output.times(10)
        
        return output
    },

    doReset(resettingLayer) {

        let upgrades = player['s'].upgrades
        let newUpgrades = []

        for (const upg of upgrades) {
            if (upg == 23 && hasMilestone('p',0)) {
                newUpgrades.push(upg)
            }
        }

        layerDataReset('s')

        player['s'].upgrades = newUpgrades
            
    },

    passiveGeneration()
    {
        output = new Decimal(0)
        
        if (hasUpgrade('s',23)) {
            output.add(this.sheepPerCount())
        }
        if (hasUpgrade('p',14)) {
            output = output.times(2)
        }
        if (hasMilestone('p',1)) {
            output = output.add(10)
        }

        return output
    },

    autoUpgrade()
    {
        return hasMilestone('p',2)
    },

    buyables: {
        11: {
            title: "Count!",
            cost(x) { return new Decimal(0) },
            display()
            { return "+ " + tmp[this.layer].sheepPerCount + " Sheep!" },
            canAfford() { return true },
            buy() {
                player[this.layer].points = player[this.layer].points
                    .add(tmp[this.layer].sheepPerCount)
            },
        },
    },

    upgrades: {
        11: {
            title: "More Sheep",
            description: "+1 Sheep/Count",
            cost: new Decimal(25),
        },
        12: {
            title: "Even More Sheep",
            description: "+3 Sheep/Count",
            cost: new Decimal(100),
        },
        13: {
            title: "A Bump Up",
            description: "+2 Sheep/Count",
            cost: new Decimal(500),
        },
        14: {
            title: "Some Milestones Now",
            description: "Unlock 2 Milestones",
            cost: new Decimal(1000),
        },

        15: {
            title: "Many More Sheep",
            description: "+36 Sheep/Count",
            cost: new Decimal(20000),
            unlocked() { return hasMilestone('s',1) }
        },
        21: {
            title: "Sheep Duplicator",
            description: "Double Sheep/Count",
            cost: new Decimal(70000),
            unlocked() { return hasMilestone('s',1) }
        },
        22: {
            title: "Sheep Quadruplicator",
            description: "Disable Sheep Duplicator<br/>Quadruple Sheep/Count",
            cost: new Decimal(200000),
            unlocked() { return hasMilestone('s',1) }
        },
        23: {
            title: "Auto Counter But Is it Really Worth It?",
            description() {
                output = "+1 Count/Sec"
                if (!hasMilestone('p',0)) output = output + "<br/> -10 Sheep/Count"
                return output
            },
            cost: new Decimal(200000),
            unlocked() { return (hasMilestone('s',1) && hasUpgrade('s',22)) || hasUpgrade('s',23)}
        },
        24: {
            title: "Second to Last Upgrade Before the Next Layer",
            description: "*10 Sheep/Count",
            cost: new Decimal(500000),
            unlocked() { return hasUpgrade('s',15) 
                         && hasUpgrade('s',21)
                         && hasUpgrade('s',22)
                         && hasUpgrade('s',23)}
        },
        25: {
            title: "The Last Upgrade Before the Next Layer",
            description: "Unlock Pillows<br/>Double Sheep/Count",
            cost: new Decimal(2500000),
            unlocked() { return hasUpgrade('s',15) 
                         && hasUpgrade('s',21)
                         && hasUpgrade('s',22)
                         && hasUpgrade('s',23)
                         && hasUpgrade('s',24)}
        },
    },

    milestones: {
        0: {
            unlocked() { return hasUpgrade('s', 14) },
            requirementDescription: "Get 2000 Sheep",
            effectDescription: "+10 Sheep/Count!",
            done() { return this.unlocked() && player[this.layer].points.gt(2000) }
        },
        1: {
            unlocked() { return hasUpgrade('s', 14) },
            requirementDescription: "Get 10,000 Sheep",
            effectDescription: "Unlock 4 more upgrades<br/>+7 Sheep/Count",
            done() { return this.unlocked() && player[this.layer].points.gt(10000) }
        },
    }
})


addLayer("p", {
    name: "Pillows", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    color: "#800080",
    requires: new Decimal(5000000), // Can be a function that takes requirement increases into account
    resource: "pillows", // Name of prestige currency
    baseResource: "sheep", // Name of resource prestige is based on
    baseAmount() {return player["s"].points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: reset for pillows", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    unlocked() {
        return hasUpgrade('s',25)
    },
    layerShown() {
        return player['p'].best.gt(0) || hasUpgrade('s',25)
    },

    passiveGeneration()
    {
        if (hasUpgrade('p',13)) {
            return new Decimal(1).div(100)
        }
        else {
            return new Decimal(0)
        }
    },

    upgrades: {
        11: {
            title: "You Just Lost A Lot Of Sheep!<br/>Let's Give You A Boost!",
            description: "*5 Sheep/Count",
            cost: new Decimal(1),
        },
        12: {
            title: "Suppertime!",
            description: "*10 Sheep/Count",
            cost: new Decimal(3),
        },
        13: {
            title: "Pillow Automator?",
            description: "1% Pillows/Sec",
            cost: new Decimal(10),
        },
        14: {
            title: "Upgrade Your Sheep Counter",
            description: "+1 Count/Sec",
            cost: new Decimal(25),
        },
        15: {
            title: "Unlock Some Milestones",
            description: "Unlock 3 Milestones",
            cost: new Decimal(50),
        },
    },

    milestones: {
        0: {
            unlocked() { return hasUpgrade('p', 15) },
            requirementDescription: "Get 75 Pillows",
            effectDescription: "Keep Sheep U23 On Pillow Reset<br/>Cancel Sheep U23 Debuff",
            done() { return this.unlocked() && player[this.layer].points.gt(75) }
        },
        1: {
            unlocked() { return hasUpgrade('p', 15) },
            requirementDescription: "Get 140 Pillows",
            effectDescription: "Upgrade Auto Counter Again !?!?<br/>+10 Count/Sec",
            done() { return this.unlocked() && player[this.layer].points.gt(140) }
        },
        2: {
            unlocked() { return hasUpgrade('p', 15) },
            requirementDescription: "Get 230 Pillows",
            effectDescription: "Autobuy Sheep Upgrades",
            done() { return this.unlocked() && player[this.layer].points.gt(230) }
        },
    }
})
