# Fix loi Git Divergent Branches

## Van de

Khi chay `./deploy-update.sh` gap loi:
```
fatal: Need to specify how to reconcile divergent branches.
[ERROR] Khong the pull code tu Git
```

## Nguyen nhan

Branch local va remote da phan nhanh (co commit khac nhau).

## Giai phap

### Option 1: Dung script moi (Khuyen dung)

Script da duoc cap nhat tu dong xu ly van de nay.

```bash
# Pull code moi
git pull origin main

# Chay lai script
./deploy-update.sh
```

Script se tu dong:
- Fetch remote changes
- Kiem tra divergence
- Reset ve remote neu can (vi tren production server nen follow remote)

---

### Option 2: Fix thu cong

#### Cach 1: Reset ve remote (MAT local changes)

```bash
cd /var/www/niemadidaphat

# Fetch remote
git fetch origin main

# Reset hard ve remote (XOA local changes)
git reset --hard origin/main

# Chay lai script
./deploy-update.sh
```

**Luu y:** Cach nay se **XOA TAT CA** local changes!

---

#### Cach 2: Rebase (Giu local changes)

```bash
cd /var/www/niemadidaphat

# Pull voi rebase
git pull --rebase origin main

# Neu co conflict, resolve roi chay:
git rebase --continue

# Chay script
./deploy-update.sh
```

---

#### Cach 3: Merge (Tao merge commit)

```bash
cd /var/www/niemadidaphat

# Pull voi merge
git pull --no-rebase origin main

# Neu co conflict, resolve roi chay:
git add .
git commit -m "Merge remote changes"

# Chay script
./deploy-update.sh
```

---

### Option 3: Cau hinh Git de tranh loi nay

#### Set default cho repository nay:

```bash
# Option 1: Merge (mac dinh)
git config pull.rebase false

# Option 2: Rebase (khuyen dung cho production)
git config pull.rebase true

# Option 3: Fast-forward only (an toan nhat)
git config pull.ff only
```

#### Set global cho tat ca repositories:

```bash
git config --global pull.rebase true
```

---

## Khuyen nghi cho Production Server

### Best practice:

1. **Production server NEN follow remote**
   - Khong commit truc tiep tren server
   - Moi thay doi phai qua Git

2. **Dung reset hard khi deploy**
   ```bash
   git fetch origin main
   git reset --hard origin/main
   ```

3. **Hoac dung script da cap nhat**
   - Script tu dong xu ly divergence
   - Reset ve remote neu can

---

## Workflow khuyen nghi

### Workflow dung:

```
Local Machine:
1. Code thay doi
2. Test local
3. git commit
4. git push

Production Server:
5. ./deploy-update.sh  # Tu dong pull va deploy
```

### Workflow SAI (tranh):

```
Production Server:
1. Sua code truc tiep  # SAI!
2. git commit          # SAI!
3. git push            # Conflict voi dev!
```

---

## Troubleshooting

### Van de: "error: Your local changes would be overwritten"

```bash
# Stash changes
git stash

# Pull
git pull origin main

# Apply stash neu can
git stash pop
```

### Van de: "refusing to merge unrelated histories"

```bash
# Allow unrelated histories (CHI dung neu chac chan)
git pull origin main --allow-unrelated-histories
```

### Van de: Conflict khi rebase

```bash
# Xem files conflict
git status

# Sua conflict trong file
nano file-conflict.txt

# Add file da sua
git add file-conflict.txt

# Continue rebase
git rebase --continue

# Hoac abort neu muon huy
git rebase --abort
```

---

## Kiem tra trang thai

```bash
# Xem local va remote branch
git branch -vv

# Xem log
git log --oneline --graph --all -10

# Xem diff giua local va remote
git diff main origin/main

# Xem commits chua push
git log origin/main..main
```

---

## Quick Commands

```bash
# Kiem tra status
git status

# Xem remote
git remote -v

# Fetch khong merge
git fetch origin

# Reset ve remote (MAT local changes)
git reset --hard origin/main

# Pull force (MAT local changes)
git fetch origin
git reset --hard origin/main

# Xem commit history
git log --oneline -10
```

---

## Luu y

- Tren production server, **uu tien follow remote**
- Khong sua code truc tiep tren server
- Dung script de deploy tu dong
- Backup truoc khi reset hard

---

Script `deploy-update.sh` da duoc cap nhat de tu dong xu ly van de nay!

