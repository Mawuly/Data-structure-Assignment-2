// Queue data structure: a linked list with head (front) and tail (rear) pointers.
// enqueue and dequeue are both O(1).
class Node {
  constructor(value) { this.value = value; this.next = null; }
}

class Queue {
  constructor() { this.head = null; this.tail = null; this.length = 0; }

  enqueue(value) {
    const node = new Node(value);
    if (this.tail) this.tail.next = node; else this.head = node;
    this.tail = node;
    this.length++;
  }

  dequeue() {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length--;
    return value;
  }

  peek() { return this.head ? this.head.value : null; }
  isEmpty() { return this.length === 0; }
  clear() { this.head = this.tail = null; this.length = 0; }

  toArray() {
    const items = [];
    for (let n = this.head; n; n = n.next) items.push(n.value);
    return items;
  }
}
