#include <stdio.h>
#include <stdlib.h>

// Merge two sorted halves: [l..m-1] and [m..r]
void merge(int arr[], int temp[], int l, int m, int r) {
    int i = l, j = m, k = l;

    while (i < m && j < r) {
        if (arr[i] <= arr[j])
            temp[k++] = arr[i++];
        else
            temp[k++] = arr[j++];
    }

    while (i < m) temp[k++] = arr[i++];
    while (j < r) temp[k++] = arr[j++];

    for (i = l; i < r; i++)
        arr[i] = temp[i];
}

void merge_sort_rec(int arr[], int temp[], int l, int r) {
    if (r - l <= 1) return;

    int m = l + (r - l) / 2;

    merge_sort_rec(arr, temp, l, m);
    merge_sort_rec(arr, temp, m, r);

    merge(arr, temp, l, m, r);
}

void merge_sort(int arr[], int n) {
    int *temp = (int*)malloc(sizeof(int) * n);
    merge_sort_rec(arr, temp, 0, n);
    free(temp);
}

int main() {
    int capacity = 100000;
    int *arr = (int*)malloc(sizeof(int) * capacity);
    int n = 0, x;

    // Read until EOF (works for your terminal runner)
    while (scanf("%d", &x) == 1) {
        arr[n++] = x;
        if (n >= capacity) {
            capacity *= 2;
            arr = (int*)realloc(arr, sizeof(int) * capacity);
        }
    }

    if (n == 0) {
        printf("Enter numbers to sort (space/newline separated)\n");
        free(arr);
        return 0;
    }

    // If first number = count of remaining numbers
    if (n >= 2 && arr[0] == n - 1) {
        // Shift array left
        for (int i = 0; i < n - 1; i++)
            arr[i] = arr[i + 1];
        n = n - 1;
    }

    merge_sort(arr, n);

    // Print sorted output
    for (int i = 0; i < n; i++) {
        if (i) printf(" ");
        printf("%d", arr[i]);
    }
    printf("\n");

    free(arr);
    return 0;
}
