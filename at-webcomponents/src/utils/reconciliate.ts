import { notNull } from "./predicates";

function itemAndNodeMatches<T, E extends HTMLElement>(
    item: T,
    dataKey: keyof T,
    node: E,
    nodeKey: keyof typeof node
  ): boolean {
    const nodeValue: any = node[nodeKey];
    const itemValue: any = item[dataKey];
    return itemValue == nodeValue;
  }
  
  export function reconciliateCollection<
    TItem,
    TItemKey extends keyof TItem,
    TNode extends HTMLElement,
    TNodeKey extends keyof TNode
  >(
    data: TItem[] | undefined = [],
    items: () => NodeListOf<TNode> | undefined,
    dataKey: TItemKey,
    nodeKey: TNodeKey,
    propertySetter: (item: TItem, element: TNode) => void,
    itemConstructor: () => TNode,
    parent: HTMLElement
  ) {
    // get actually exisisting elements
    const nodeArr = Array.from(items() ?? []);
    const existingElements = data?.map((item) =>
      nodeArr.find((node) => itemAndNodeMatches(item, dataKey, node, nodeKey))
    ).filter((el) => el != null) ?? [];
    // remove lost elements
    nodeArr.forEach((el) => (existingElements.includes(el) ? null : el.remove()));
  
    // add or move
    data?.forEach((item, index) => {
      let elementIndex = existingElements.filter(notNull).findIndex((node) =>
        itemAndNodeMatches(item, dataKey, node, nodeKey)
      );
      const created = elementIndex < 0;
      const element = created
        ? itemConstructor()
        : existingElements.at(elementIndex);
  
      if (!element) {
        throw new Error(`unable to find element ${JSON.stringify(item)}`);
      }
      // check if reoder is needed
      const prevItem = items()?.[index - 1];
      if (index === 0 || !prevItem) parent.prepend(element);
      else prevItem.insertAdjacentElement('afterend', element);
  
      // setting all properties
      propertySetter(item, element);
    });
  }
  