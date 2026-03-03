/* fast_merge_sort.c
   Fast I/O + iterative bottom-up merge sort */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static inline int readInt(int *out) {
    int c = getchar_unlocked();
    if (c == EOF) return 0;
    while (c <= ' ' && c != EOF) c = getchar_unlocked();
    if (c == EOF) return 0;
    int sign = 1;
    if (c == '-') { sign = -1; c = getchar_unlocked(); }
    int val = 0;
    while (c > ' ') { val = val * 10 + (c - '0'); c = getchar_unlocked(); }
    *out = val * sign;
    return 1;
}

void merge_pass(int *a, int *tmp, int n, int width) {
    int i;
    for (i = 0; i < n; i += 2*width) {
        int l = i;
        int m = (i + width < n) ? (i + width) : n;
        int r = (i + 2*width < n) ? (i + 2*width) : n;
        int p = l, q = m, k = l;
        while (p < m && q < r) tmp[k++] = (a[p] <= a[q] ? a[p++] : a[q++]);
        while (p < m) tmp[k++] = a[p++];
        while (q < r) tmp[k++] = a[q++];
    }
    // copy back
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
    // Read all ints (flexible: if first = count, treat accordingly)
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
        // nothing
        return 0;
    }
    // if first equals remaining count
    if (n >= 2 && arr[0] == n - 1) {
        memmove(arr, arr + 1, (n - 1) * sizeof(int));
        n = n - 1;
    }

    merge_sort_iter(arr, n);

    // output efficiently
    char outbuf[64];
    for (int i = 0; i < n; ++i) {
        if (i) putchar_unlocked(' ');
        // write number
        int v = arr[i];
        if (v == 0) putchar_unlocked('0');
        else {
            int neg = 0;
            if (v < 0) { neg = 1; v = -v; }
            int pos = 0;
            while (v) {
                outbuf[pos++] = '0' + (v % 10);
                v /= 10;
            }
            if (neg) putchar_unlocked('-');
            for (int j = pos - 1; j >= 0; --j) putchar_unlocked(outbuf[j]);
        }
    }
    putchar_unlocked('\n');

    free(arr);
    return 0;
}
