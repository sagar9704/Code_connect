#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static inline int readInt(int *out) {
    int c = getchar();  // Fixed: use portable getchar
    if (c == EOF) return 0;
    while (c <= ' ' && c != EOF) c = getchar();
    if (c == EOF) return 0;
    int sign = 1;
    if (c == '-') { sign = -1; c = getchar(); }
    int val = 0;
    while (c > ' ') { val = val * 10 + (c - '0'); c = getchar(); }
    *out = val * sign;
    return 1;
}

void merge_pass(int *a, int *tmp, int n, int width) {
    for (int i = 0; i < n; i += 2*width) {
        int l = i;
        int m = (i + width < n) ? (i + width) : n;
        int r = (i + 2*width < n) ? (i + 2*width) : n;
        int p = l, q = m, k = l;
        while (p < m && q < r) tmp[k++] = (a[p] <= a[q] ? a[p++] : a[q++]);
        while (p < m) tmp[k++] = a[p++];
        while (q < r) tmp[k++] = a[q++];
    }
    memcpy(a, tmp, n * sizeof(int));
}

void merge_sort_iter(int *a, int n) {
    int *tmp = (int*)malloc(n * sizeof(int));
    if (!tmp) return;
    for (int width = 1; width < n; width <<= 1) {
        merge_pass(a, tmp, n, width);
    }
    free(tmp);
}

int main() {
    int capacity = 1<<16;
    int *arr = malloc(capacity * sizeof(int));
    int n = 0;
    int x;

    while (readInt(&x)) {
        if (n >= capacity) {
            capacity <<= 1;
            arr = realloc(arr, capacity * sizeof(int));
        }
        arr[n++] = x;
    }

    if (n == 0) {
        return 0;
    }

    if (n >= 2 && arr[0] == n - 1) {
        memmove(arr, arr + 1, (n - 1) * sizeof(int));
        n--;
    }

    merge_sort_iter(arr, n);

    for (int i = 0; i < n; ++i) {
        if (i) putchar(' ');   // Fixed: use putchar
        printf("%d", arr[i]);
    }
    putchar('\n');

    free(arr);
    return 0;
}
