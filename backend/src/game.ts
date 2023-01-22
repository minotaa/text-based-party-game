// im gonna prototype this while ur working on frontend stuff

// im gonna use oop for now


// Background tiles
interface Tile {
    character: string,
    isSolid: boolean
}

interface GameObject {
    character: string,
    isSolid: boolean,
    position: {x: number, y: number}
}

function replaceAt(orginal: string, index: number, char: string) {
    return orginal.substring(0, index) + char + orginal.substring(index + char.length);
}

export class Dungeon {
    tiles: Tile[][] = []
    objects: GameObject[] = []
    width: number
    height: number

    constructor (width: number, height: number) {
        this.width = width
        this.height = height
        this.generate(width, height)
    }

    generate(width: number, height: number) {
        for (let h = 0; h < height; h++) {
            const row: Tile[] = []
            for (let w = 0; w < width; w++) {
                row.push({character: " ", isSolid: false})
            }
            this.tiles.push(row)
        }
    }

    getText() {
        let output = ""
        this.tiles.forEach((row) => { row.forEach((tile) => output += tile.character); output += "\n" })
        this.objects.forEach((obj) => output = replaceAt(output, obj.position.y * (this.height + 1) + obj.position.x, obj.character))
        return output
    }

    updateObjectPosition(obj: GameObject, x: number, y: number) {
        this.objects.forEach((o) =>
            if (o.position.x == x && o.position.y == y) return false)

        obj.position = {x, y}
        return true
    }
}