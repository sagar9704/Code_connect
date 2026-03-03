def binary_search_iterative(arr, target):
    """Perform binary search iteratively on a sorted list."""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2  # Middle index
        if arr[mid] == target:
            return mid  # Found
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # Not found


def binary_search_recursive(arr, target, left, right):
    """Perform binary search recursively on a sorted list."""
    if left > right:
        return -1  # Not found
    
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)


if __name__ == "__main__":
    try:
        # Input: sorted list of integers
        arr = list(map(int, input("Enter sorted numbers separated by spaces: ").split()))
        if arr != sorted(arr):
            print("Error: The list must be sorted in ascending order.")
            exit(1)
        
        target = int(input("Enter the number to search: "))
        
        # Iterative search
        idx_iter = binary_search_iterative(arr, target)
        if idx_iter != -1:
            print(f"(Iterative) Found {target} at index {idx_iter}")
        else:
            print(f"(Iterative) {target} not found")
        
        # Recursive search
        idx_rec = binary_search_recursive(arr, target, 0, len(arr) - 1)
        if idx_rec != -1:
            print(f"(Recursive) Found {target} at index {idx_rec}")
        else:
            print(f"(Recursive) {target} not found")
    
    except ValueError:
        print("Invalid input. Please enter integers only.")