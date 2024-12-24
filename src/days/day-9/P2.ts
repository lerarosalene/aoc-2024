import assert from "../../vendor/assert";

export namespace P2 {
  interface FreeSpace {
    __type: "free";
    length: number;
  }

  interface FileBlock {
    __type: "file";
    length: number;
    fileID: number;
  }

  type DiskBlock = FreeSpace | FileBlock;
  export type Disk = Array<DiskBlock>;

  export function parse(input: string): Disk {
    let result: Disk = [];
    let currentFileID = 0;
    let isFile = true;

    for (let char of input) {
      if (isFile) {
        result.push({
          __type: "file",
          length: Number(char),
          fileID: currentFileID,
        });
        currentFileID++;
      } else {
        result.push({ __type: "free", length: Number(char) });
      }
      isFile = !isFile;
    }

    return result;
  }

  export function diskToString(disk: Disk) {
    return disk
      .map((block) =>
        block.__type === "file"
          ? String(block.fileID).repeat(block.length)
          : ".".repeat(block.length),
      )
      .join("");
  }

  export function move(disk: Disk, fileIndex: number, freeSpaceIndex: number) {
    assert(disk[fileIndex].__type === "file", `Block #${fileIndex} is file`);
    assert(
      disk[freeSpaceIndex].__type === "free",
      `Block #${freeSpaceIndex} is free`,
    );
    assert(
      disk[fileIndex].length <= disk[freeSpaceIndex].length,
      "There is enough free space",
    );
    assert(fileIndex > freeSpaceIndex, "moving file to the left");
    const file = disk[fileIndex] as FileBlock;
    const free = disk[freeSpaceIndex] as FreeSpace;
    const newFreeSpace: FreeSpace = { __type: "free", length: file.length };
    const newFileBlock: FileBlock = {
      __type: "file",
      length: file.length,
      fileID: file.fileID,
    };
    disk.splice(fileIndex, 1, newFreeSpace);
    if (file.length < free.length) {
      const leftover: FreeSpace = {
        __type: "free",
        length: free.length - file.length,
      };
      disk.splice(freeSpaceIndex, 1, newFileBlock, leftover);
    } else {
      disk.splice(freeSpaceIndex, 1, newFileBlock);
    }
  }

  export function checkSum(disk: Disk) {
    let sum = 0;
    let cellIndex = 0;
    for (const block of disk) {
      if (block.__type === "free") {
        cellIndex += block.length;
        continue;
      }
      for (let i = 0; i < block.length; ++i) {
        sum += (i + cellIndex) * block.fileID;
      }
      cellIndex += block.length;
    }
    return sum;
  }
}
