export const userAggregation = (byUserCode: any, byUserEmail: any) => [
    {
        '$match': {
            $and: [
                byUserCode,
                byUserEmail
            ]
        }
    }, {
        '$lookup': {
            'from': 'role',
            'localField': 'role',
            'foreignField': 'name',
            'as': 'permissionsExpanded'
        }
    }, {
        '$unwind': {
            'path': '$permissionsExpanded'
        }
    }, {
        '$addFields': {
            'permissions': '$permissionsExpanded.permissions'
        }
    }, {
        '$project': {
            'permissionsExpanded': 0
        }
    }, {
        '$lookup': {
            'from': 'organization',
            'localField': 'company',
            'foreignField': 'name',
            'as': 'organization'
        }
    }, {
        '$unwind': {
            'path': '$organization'
        }
    }, {
        '$addFields': {
            'organizationTheme': '$organization.theme'
        }
    }, {
        '$lookup': {
            'from': 'theme',
            'localField': 'organizationTheme',
            'foreignField': 'name',
            'as': 'organizationTheme'
        }
    }, {
        '$unwind': {
            'path': '$organizationTheme'
        }
    }, {
        '$lookup': {
            'from': 'membership',
            'localField': 'organization.membershipCode',
            'foreignField': 'code',
            'as': 'membership'
        }
    }, {
        '$unwind': {
            'path': '$membership'
        }
    }
]