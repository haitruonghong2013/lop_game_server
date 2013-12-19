var newNode = function()
{
	var newNodeObj = {};
    newNodeObj.next = null;
    newNodeObj.prev = null;
    newNodeObj.data = null;
	return newNodeObj;
};

var newLinkedList = exports.newLinkedList = function()
{
	var newLinkedListObj = {};
	newLinkedListObj.head = newNode();
	newLinkedListObj.head.next = newLinkedListObj.head.prev = newLinkedListObj.head;
	newLinkedListObj.length = 0;

	newLinkedListObj.add = function( data )
	{
		return newLinkedListObj.addLast(data);
	};

	newLinkedListObj.addAt = function( index, data )
	{
		var head = newLinkedListObj.head;
		var currentNode = head.next;
		var i = 0;
		while(currentNode != head)
		{
			if(i == index)
			{
				var node = newNode();
				node.data = data;
				currentNode.prev.next = node;
				node.prev = currentNode.prev;
				currentNode.prev = node;
				node.next = currentNode;
				newLinkedListObj.length++;
				return i;
			}
			currentNode = currentNode.next;
			i++;
		}
		return -1;
	};

	newLinkedListObj.addFirst = function( data )
	{
		var node = newNode();
		node.data = data;
		newLinkedListObj.head.next.prev = node;
		node.next = newLinkedListObj.head.next;
		newLinkedListObj.head.next = node;
		node.prev = newLinkedListObj.head;
		newLinkedListObj.length++;
		return data;
	};

	newLinkedListObj.addLast = function( data )
	{
		var node = newNode();
		node.data = data;
		newLinkedListObj.head.prev.next = node;
		node.prev = newLinkedListObj.head.prev;
		newLinkedListObj.head.prev = node;
		node.next = newLinkedListObj.head;
		newLinkedListObj.length++;
		return data;
	};

	newLinkedListObj.get = function( index )
	{
		var head = newLinkedListObj.head;
		var currentNode = head.next;
		var i = 0;
		while(currentNode != head)
		{
			if(i == index)
			{
				return currentNode.data;
			}
			currentNode = currentNode.next;
			i++;
		}
		return null;
	};

	// remove first
	newLinkedListObj.remove = function( )
	{
		if(newLinkedListObj.head.next == newLinkedListObj.head)
		{
			return null;
		}

		var toRev = newLinkedListObj.head.next;

		newLinkedListObj.head.next.prev = null;
		newLinkedListObj.head.next = newLinkedListObj.head.next.next;
		newLinkedListObj.head.next.prev.next = null;
		newLinkedListObj.head.next.prev = newLinkedListObj.head;
		newLinkedListObj.length--;
		return toRev.data;
	};

	newLinkedListObj.removeLast = function( )
	{
		if(newLinkedListObj.head.next == newLinkedListObj.head)
		{
			return null;
		}

		var toRev = newLinkedListObj.head.prev;
		newLinkedListObj.head.prev.next = null;
		newLinkedListObj.head.prev = newLinkedListObj.head.prev.prev;
		newLinkedListObj.head.prev.next.prev = null;
		newLinkedListObj.head.prev.next = newLinkedListObj.head;
		newLinkedListObj.length--;
		return toRev.data;
	};

	newLinkedListObj.removeAt = function( index )
	{
		if(newLinkedListObj.head.next == newLinkedListObj.head)
		{
			return null;
		}

		var head = newLinkedListObj.head;
		var currentNode = head.next;
		var i = 0;
		while(currentNode != head)
		{
			if(i == index)
			{
				currentNode.prev.next = currentNode.next;
				currentNode.next.prev = currentNode.prev;
				currentNode.next = currentNode.prev = null;
				newLinkedListObj.length--;
				return currentNode.data;
			}

			currentNode = currentNode.next;
			i++;
		}
		return null;
	};

	newLinkedListObj.size = function( )
	{
		return newLinkedListObj.length;
	};

	newLinkedListObj.poll = function( )
	{
		// return newLinkedListObj.head.prev.data;
		return newLinkedListObj.remove();
	};

	newLinkedListObj.isEmpty = function( )
	{
		return newLinkedListObj.length == 0;
	};

	// if callback return true, the current item will be removed
	newLinkedListObj.foreach = function( callback )
	{
		var head = newLinkedListObj.head;
		var currentNode = head.next;
		var i = 0;
		while(currentNode != head)
		{
			if(callback(i, currentNode.data))
			{
				var newCurrent = currentNode.next;
				currentNode.prev.next = currentNode.next;
				currentNode.next.prev = currentNode.prev;
				currentNode.next = currentNode.prev = null;
				newLinkedListObj.length--;
				currentNode = newCurrent;
			}
			else
			{
				currentNode = currentNode.next;
				i++;
			}
		}
		return i;
	};

	// if callback return true, the current item will be removed
	newLinkedListObj.foreachBack = function( callback )
	{
		var head = newLinkedListObj.head;
		var currentNode = head.prev;
		var i = newLinkedListObj.length - 1;
		while(currentNode != head)
		{
			if(callback(i, currentNode.data))
			{
				var newCurrent = currentNode.next;
				currentNode.prev.next = currentNode.next;
				currentNode.next.prev = currentNode.prev;
				currentNode.next = currentNode.prev = null;
				newLinkedListObj.length--;
				currentNode = newCurrent;
			}
			else
			{
				currentNode = currentNode.prev;
				i--;
			}
		}
		return newLinkedListObj.length;
	};

	newLinkedListObj.printHead = function( )
	{
		console.log(newLinkedListObj.head);
	};

	return newLinkedListObj;
};