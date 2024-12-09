import { P1 } from "./P1";
import { P2 } from "./P2";

export function partOne(input: string) {
  const disk = P1.parse(input.trim());
  let freeSpacePtr = P1.nextFreeSpace(disk, 0);
  let fileBlockPtr = P1.prevFileBlock(disk, disk.length - 1);

  while (freeSpacePtr < fileBlockPtr) {
    disk[freeSpacePtr] = disk[fileBlockPtr];
    disk[fileBlockPtr] = null;
    freeSpacePtr = P1.nextFreeSpace(disk, freeSpacePtr + 1);
    fileBlockPtr = P1.prevFileBlock(disk, fileBlockPtr - 1);
  }

  return P1.checkSum(disk);
}

export function partTwo(input: string) {
  const disk = P2.parse(input.trim());
  const attempted = new Set<number>();
  for (let i = 0; i < disk.length; ++i) {
    let index = disk.length - 1 - i;
    const block = disk[index];
    if (block.__type === "free" || attempted.has(block.fileID)) {
      continue;
    }
    attempted.add(block.fileID);
    const freeSpace = disk.findIndex(
      (b) => b.__type === "free" && b.length >= block.length,
    );
    if (freeSpace === -1 || freeSpace > index) {
      continue;
    }
    P2.move(disk, index, freeSpace);
  }

  return P2.checkSum(disk);
}
