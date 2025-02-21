;; Avatar Contract

(define-data-var next-avatar-id uint u0)

(define-map avatars
  { avatar-id: uint }
  {
    owner: principal,
    name: (string-ascii 64),
    level: uint,
    experience: uint
  }
)

(define-public (create-avatar (name (string-ascii 64)))
  (let
    ((avatar-id (+ (var-get next-avatar-id) u1)))
    (var-set next-avatar-id avatar-id)
    (ok (map-set avatars
      { avatar-id: avatar-id }
      {
        owner: tx-sender,
        name: name,
        level: u1,
        experience: u0
      }
    ))
  )
)

(define-public (gain-experience (avatar-id uint) (amount uint))
  (let
    ((avatar (unwrap! (map-get? avatars { avatar-id: avatar-id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner avatar)) (err u403))
    (let
      ((new-experience (+ (get experience avatar) amount))
       (new-level (+ (get level avatar) (/ new-experience u100))))
      (ok (map-set avatars
        { avatar-id: avatar-id }
        (merge avatar {
          experience: new-experience,
          level: new-level
        })
      ))
    )
  )
)

(define-read-only (get-avatar (avatar-id uint))
  (map-get? avatars { avatar-id: avatar-id })
)

