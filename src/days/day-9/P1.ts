export namespace P1 {
  export type Disk = Array<number | null>;
  export function parse(input: string): Disk {
    let result: Disk = [];
    let currentFileID = 0;
    let isFile = true;

    for (let char of input) {
      if (isFile) {
        for (let i = 0; i < Number(char); ++i) {
          result.push(currentFileID);
        }
        currentFileID++;
      } else {
        for (let i = 0; i < Number(char); ++i) {
          result.push(null);
        }
      }
      isFile = !isFile;
    }

    return result;
  }

  export function diskToString(disk: P1.Disk) {
    return disk.map((i) => (i === null ? "." : String(i))).join("");
  }

  export function nextFreeSpace(disk: Disk, startFrom: number) {
    while (disk[startFrom] !== null && startFrom < disk.length) startFrom++;
    if (startFrom === disk.length) {
      return -1;
    }
    return startFrom;
  }

  export function prevFileBlock(disk: Disk, startFrom: number) {
    while (disk[startFrom] === null && startFrom >= 0) startFrom--;
    return startFrom;
  }

  export function checkSum(disk: Disk) {
    let sum = 0;
    for (let i = 0; i < disk.length; ++i) {
      sum += i * (disk[i] ?? 0);
    }
    return sum;
  }
}
