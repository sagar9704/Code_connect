#include <bits/stdc++.h>
using namespace std;

// Merge two sorted ranges [l, m) and [m, r) stored in `a`
static void merge_range(vector<long long>& a, vector<long long>& tmp, int l, int m, int r) {
    int i = l, j = m, k = l;
    while (i < m && j < r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else tmp[k++] = a[j++];
    }
    while (i < m) tmp[k++] = a[i++];
    while (j < r) tmp[k++] = a[j++];
    for (int x = l; x < r; ++x) a[x] = tmp[x];
}

static void mergesort_rec(vector<long long>& a, vector<long long>& tmp, int l, int r) {
    if (r - l <= 1) return;
    int m = l + (r - l) / 2;
    mergesort_rec(a, tmp, l, m);
    mergesort_rec(a, tmp, m, r);
    merge_range(a, tmp, l, m, r);
}

void merge_sort(vector<long long>& a) {
    if (a.empty()) return;
    vector<long long> tmp(a.size());
    mergesort_rec(a, tmp, 0, (int)a.size());
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Read all integers from stdin (works with interactive input or pasted input)
    vector<long long> vals;
    long long x;
    while (cin >> x) vals.push_back(x);

    if (vals.empty()) {
        // No input - show usage
        cout << "Usage examples:\n"
             << "1) First give count, then numbers:\n"
             << "   5 3 1 4 5 2\n"
             << "2) Or paste numbers directly (space or newline separated):\n"
             << "   3 1 4 1 5\n";
        return 0;
    }

    // If first number equals (remaining count), treat it as `n`
    vector<long long> arr;
    if (vals.size() >= 2 && vals[0] == (long long)(vals.size() - 1)) {
        arr.assign(vals.begin() + 1, vals.end());
    } else {
        // Otherwise treat all values as the array to sort
        arr = vals;
    }

    merge_sort(arr);

    // Print sorted array on one line
    for (size_t i = 0; i < arr.size(); ++i) {
        if (i) cout << ' ';
        cout << arr[i];
    }
    cout << '\n';
    return 0;
}
