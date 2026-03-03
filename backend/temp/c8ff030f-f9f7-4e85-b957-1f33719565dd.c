#include <iostream.h>
#include <vector>
#include <algorithm>

using namespace std;

void merge_range(vector<long long>& a, vector<long long>& tmp, int l, int m, int r) {
    int i = l, j = m, k = l;
    while (i < m && j < r) {
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    }
    while (i < m) tmp[k++] = a[i++];
    while (j < r) tmp[k++] = a[j++];
    for (int x = l; x < r; ++x) a[x] = tmp[x];
}

void mergesort_rec(vector<long long>& a, vector<long long>& tmp, int l, int r) {
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

    vector<long long> vals;
    long long x;

    while (cin >> x) vals.push_back(x);

    if (vals.empty()) {
        cout << "Enter numbers to sort (space or newline separated).\n";
        return 0;
    }

    // If first number equals the rest count
    vector<long long> arr;
    if (vals.size() >= 2 && vals[0] == (long long)(vals.size() - 1)) {
        arr.assign(vals.begin() + 1, vals.end());
    } else {
        arr = vals;
    }

    merge_sort(arr);

    for (size_t i = 0; i < arr.size(); ++i) {
        if (i) cout << " ";
        cout << arr[i];
    }
    cout << "\n";
    return 0;
}
