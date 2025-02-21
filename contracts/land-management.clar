;; Land Management Contract

(define-data-var next-parcel-id uint u0)

(define-map land-parcels
  { parcel-id: uint }
  {
    owner: principal,
    name: (string-ascii 64),
    size: uint,
    location-x: int,
    location-y: int
  }
)

(define-public (register-land-parcel (name (string-ascii 64)) (size uint) (location-x int) (location-y int))
  (let
    ((parcel-id (+ (var-get next-parcel-id) u1)))
    (var-set next-parcel-id parcel-id)
    (ok (map-set land-parcels
      { parcel-id: parcel-id }
      {
        owner: tx-sender,
        name: name,
        size: size,
        location-x: location-x,
        location-y: location-y
      }
    ))
  )
)

(define-public (transfer-land (parcel-id uint) (new-owner principal))
  (let
    ((parcel (unwrap! (map-get? land-parcels { parcel-id: parcel-id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner parcel)) (err u403))
    (ok (map-set land-parcels
      { parcel-id: parcel-id }
      (merge parcel { owner: new-owner })
    ))
  )
)

(define-read-only (get-land-parcel (parcel-id uint))
  (map-get? land-parcels { parcel-id: parcel-id })
)

