/**
 * Lovart智能资源映射类型定义
 * 自动生成 - 请勿手动修改
 */

export interface SmartLovartResource {
  fileName: string;
  originalPath: string;
  category: 'ui-interface' | 'components' | 'icon-sets' | 'icons';
  subcategory: string;
  theme: 'modern' | 'business' | 'tech';
  size: number;
  confidence: number;
  webPath: string;
}

export interface SmartLovartResourceMapping {
  metadata: {
    totalFiles: number;
    processingTime: string;
    algorithm: string;
    version: string;
  };
  categories: Record<string, Array<{
    fileName: string;
    confidence: number;
    size: number;
  }>>;
  themes: Record<string, Array<{
    fileName: string;
    category: string;
    confidence: number;
  }>>;
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
  files: SmartLovartResource[];
}

// 智能资源映射数据
export const smartLovartResourceMapping: SmartLovartResourceMapping = {
  "metadata": {
    "totalFiles": 422,
    "processingTime": "2025-09-15T11:31:34.053Z",
    "algorithm": "smart-categorization",
    "version": "1.0.0"
  },
  "categories": {
    "components": [
      {
        "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7(1).png",
        "confidence": 0.7,
        "size": 593666
      },
      {
        "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png",
        "confidence": 0.7,
        "size": 668029
      },
      {
        "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959(1).png",
        "confidence": 0.7,
        "size": 700797
      },
      {
        "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png",
        "confidence": 0.7,
        "size": 792145
      },
      {
        "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048(1).png",
        "confidence": 0.7,
        "size": 669842
      },
      {
        "fileName": "0aa518d0-450c-4337-984b-1efad25253d4(1).png",
        "confidence": 0.7,
        "size": 686947
      },
      {
        "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a(1).png",
        "confidence": 0.7,
        "size": 708548
      },
      {
        "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed(1).png",
        "confidence": 0.7,
        "size": 696744
      },
      {
        "fileName": "1639d850-a711-4215-9f80-335697f71e57(1).png",
        "confidence": 0.7,
        "size": 776188
      },
      {
        "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b(1).png",
        "confidence": 0.7,
        "size": 642268
      },
      {
        "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2(1).png",
        "confidence": 0.7,
        "size": 434039
      },
      {
        "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd(1).png",
        "confidence": 0.7,
        "size": 569525
      },
      {
        "fileName": "239d3751-e13c-4c3f-91db-ece731449203(1).png",
        "confidence": 0.7,
        "size": 519334
      },
      {
        "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6(1).png",
        "confidence": 0.7,
        "size": 619348
      },
      {
        "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(1).png",
        "confidence": 0.7,
        "size": 781623
      },
      {
        "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8(1).png",
        "confidence": 0.7,
        "size": 696991
      },
      {
        "fileName": "285e6817-9453-4663-98ca-599e602e29b1(1).png",
        "confidence": 0.7,
        "size": 563291
      },
      {
        "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d(1).png",
        "confidence": 0.7,
        "size": 627971
      },
      {
        "fileName": "2be10054-248f-433b-b223-3adc09e89f53(1).png",
        "confidence": 0.7,
        "size": 670936
      },
      {
        "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4(1).png",
        "confidence": 0.7,
        "size": 437811
      },
      {
        "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066(1).png",
        "confidence": 0.7,
        "size": 587994
      },
      {
        "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618(1).png",
        "confidence": 0.7,
        "size": 607187
      },
      {
        "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831(1).png",
        "confidence": 0.7,
        "size": 677580
      },
      {
        "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(1).png",
        "confidence": 0.7,
        "size": 633407
      },
      {
        "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115(1).png",
        "confidence": 0.7,
        "size": 667942
      },
      {
        "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d(1).png",
        "confidence": 0.7,
        "size": 422770
      },
      {
        "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949(1).png",
        "confidence": 0.7,
        "size": 525699
      },
      {
        "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b(1).png",
        "confidence": 0.7,
        "size": 718710
      },
      {
        "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712(1).png",
        "confidence": 0.7,
        "size": 622894
      },
      {
        "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08(1).png",
        "confidence": 0.7,
        "size": 609625
      },
      {
        "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e(1).png",
        "confidence": 0.7,
        "size": 674934
      },
      {
        "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8(1).png",
        "confidence": 0.7,
        "size": 610291
      },
      {
        "fileName": "4b985711-8703-4729-93a1-06d9186e42b6(1).png",
        "confidence": 0.7,
        "size": 549670
      },
      {
        "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3(1).png",
        "confidence": 0.7,
        "size": 596024
      },
      {
        "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(1).png",
        "confidence": 0.7,
        "size": 686869
      },
      {
        "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7(1).png",
        "confidence": 0.7,
        "size": 464496
      },
      {
        "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2(1).png",
        "confidence": 0.7,
        "size": 604240
      },
      {
        "fileName": "5122054d-82ae-4eca-948a-7c856a70e435(1).png",
        "confidence": 0.7,
        "size": 707220
      },
      {
        "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6(1).png",
        "confidence": 0.7,
        "size": 787946
      },
      {
        "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963(1).png",
        "confidence": 0.7,
        "size": 568801
      },
      {
        "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82(1).png",
        "confidence": 0.7,
        "size": 713497
      },
      {
        "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794(1).png",
        "confidence": 0.7,
        "size": 534106
      },
      {
        "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b(1).png",
        "confidence": 0.7,
        "size": 617398
      },
      {
        "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4(1).png",
        "confidence": 0.7,
        "size": 789020
      },
      {
        "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a(1).png",
        "confidence": 0.7,
        "size": 725524
      },
      {
        "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7(1).png",
        "confidence": 0.7,
        "size": 696249
      },
      {
        "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd(1).png",
        "confidence": 0.7,
        "size": 676221
      },
      {
        "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68(1).png",
        "confidence": 0.7,
        "size": 725019
      },
      {
        "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9(1).png",
        "confidence": 0.7,
        "size": 687771
      },
      {
        "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(1).png",
        "confidence": 0.7,
        "size": 705777
      },
      {
        "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6(1).png",
        "confidence": 0.7,
        "size": 631956
      },
      {
        "fileName": "7288ca44-2d97-448e-af22-a5a07734562f(1).png",
        "confidence": 0.7,
        "size": 494691
      },
      {
        "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39(1).png",
        "confidence": 0.7,
        "size": 723432
      },
      {
        "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b(1).png",
        "confidence": 0.7,
        "size": 592511
      },
      {
        "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d(1).png",
        "confidence": 0.7,
        "size": 632078
      },
      {
        "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029(1).png",
        "confidence": 0.7,
        "size": 632959
      },
      {
        "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(1).png",
        "confidence": 0.7,
        "size": 689865
      },
      {
        "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(1).png",
        "confidence": 0.7,
        "size": 674480
      },
      {
        "fileName": "809723b7-130e-478c-9b54-fe40739a1eee(1).png",
        "confidence": 0.7,
        "size": 537732
      },
      {
        "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124(1).png",
        "confidence": 0.7,
        "size": 331804
      },
      {
        "fileName": "86e394a7-f886-4abd-9b19-72301c36a392(1).png",
        "confidence": 0.7,
        "size": 411230
      },
      {
        "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4(1).png",
        "confidence": 0.7,
        "size": 709145
      },
      {
        "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(1).png",
        "confidence": 0.7,
        "size": 609543
      },
      {
        "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f(1).png",
        "confidence": 0.7,
        "size": 636886
      },
      {
        "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e(1).png",
        "confidence": 0.7,
        "size": 522992
      },
      {
        "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c(1).png",
        "confidence": 0.7,
        "size": 632879
      },
      {
        "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d(1).png",
        "confidence": 0.7,
        "size": 658717
      },
      {
        "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa(1).png",
        "confidence": 0.7,
        "size": 678251
      },
      {
        "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff(1).png",
        "confidence": 0.7,
        "size": 791977
      },
      {
        "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3(1).png",
        "confidence": 0.7,
        "size": 521892
      },
      {
        "fileName": "9b437738-8336-4c90-ae33-87d43225bae7(1).png",
        "confidence": 0.7,
        "size": 639189
      },
      {
        "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a(1).png",
        "confidence": 0.7,
        "size": 526335
      },
      {
        "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(1).png",
        "confidence": 0.7,
        "size": 600351
      },
      {
        "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720(1).png",
        "confidence": 0.7,
        "size": 758417
      },
      {
        "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5(1).png",
        "confidence": 0.7,
        "size": 717174
      },
      {
        "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e(1).png",
        "confidence": 0.7,
        "size": 505925
      },
      {
        "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(1).png",
        "confidence": 0.7,
        "size": 511078
      },
      {
        "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558(1).png",
        "confidence": 0.7,
        "size": 503575
      },
      {
        "fileName": "b324bc6d-6cf2-4542-aa05-424191416330(1).png",
        "confidence": 0.7,
        "size": 738581
      },
      {
        "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(1).png",
        "confidence": 0.7,
        "size": 581873
      },
      {
        "fileName": "b83537c4-4315-4f1e-9970-b0416829e686(1).png",
        "confidence": 0.7,
        "size": 480137
      },
      {
        "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8(1).png",
        "confidence": 0.7,
        "size": 774946
      },
      {
        "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(1).png",
        "confidence": 0.7,
        "size": 768349
      },
      {
        "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2(1).png",
        "confidence": 0.7,
        "size": 688975
      },
      {
        "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc(1).png",
        "confidence": 0.7,
        "size": 704818
      },
      {
        "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697(1).png",
        "confidence": 0.7,
        "size": 634048
      },
      {
        "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(1).png",
        "confidence": 0.7,
        "size": 715160
      },
      {
        "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982(1).png",
        "confidence": 0.7,
        "size": 713433
      },
      {
        "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(1).png",
        "confidence": 0.7,
        "size": 528791
      },
      {
        "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(1).png",
        "confidence": 0.7,
        "size": 677423
      },
      {
        "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532(1).png",
        "confidence": 0.7,
        "size": 674088
      },
      {
        "fileName": "d59721da-fd82-4d32-805b-14377478bf3d(1).png",
        "confidence": 0.7,
        "size": 600384
      },
      {
        "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a(1).png",
        "confidence": 0.7,
        "size": 607436
      },
      {
        "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(1).png",
        "confidence": 0.7,
        "size": 603738
      },
      {
        "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125(1).png",
        "confidence": 0.7,
        "size": 499883
      },
      {
        "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827(1).png",
        "confidence": 0.7,
        "size": 575207
      },
      {
        "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b(1).png",
        "confidence": 0.7,
        "size": 596486
      },
      {
        "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(1).png",
        "confidence": 0.7,
        "size": 599491
      },
      {
        "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a(1).png",
        "confidence": 0.7,
        "size": 571562
      },
      {
        "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e(1).png",
        "confidence": 0.7,
        "size": 700105
      },
      {
        "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(1).png",
        "confidence": 0.7,
        "size": 538473
      },
      {
        "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(1).png",
        "confidence": 0.7,
        "size": 578329
      },
      {
        "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b(1).png",
        "confidence": 0.7,
        "size": 745350
      },
      {
        "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(1).png",
        "confidence": 0.7,
        "size": 375190
      },
      {
        "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14(1).png",
        "confidence": 0.7,
        "size": 622303
      },
      {
        "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b(1).png",
        "confidence": 0.7,
        "size": 795763
      },
      {
        "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d(1).png",
        "confidence": 0.7,
        "size": 683400
      },
      {
        "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b(1).png",
        "confidence": 0.7,
        "size": 503783
      },
      {
        "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d(1).png",
        "confidence": 0.7,
        "size": 713187
      },
      {
        "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a(1).png",
        "confidence": 0.7,
        "size": 472593
      }
    ],
    "icons": [
      {
        "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7(2).png",
        "confidence": 0.7,
        "size": 6540
      },
      {
        "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7.png",
        "confidence": 0.7,
        "size": 714
      },
      {
        "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png",
        "confidence": 0.7,
        "size": 11968
      },
      {
        "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png",
        "confidence": 0.7,
        "size": 1144
      },
      {
        "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959(2).png",
        "confidence": 0.7,
        "size": 12518
      },
      {
        "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959.png",
        "confidence": 0.7,
        "size": 1494
      },
      {
        "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a(2).png",
        "confidence": 0.7,
        "size": 15574
      },
      {
        "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a.png",
        "confidence": 0.7,
        "size": 1514
      },
      {
        "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png",
        "confidence": 0.7,
        "size": 11148
      },
      {
        "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c.png",
        "confidence": 0.7,
        "size": 1178
      },
      {
        "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(2).png",
        "confidence": 0.7,
        "size": 19066
      },
      {
        "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d.png",
        "confidence": 0.7,
        "size": 1664
      },
      {
        "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048(2).png",
        "confidence": 0.7,
        "size": 12122
      },
      {
        "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048.png",
        "confidence": 0.7,
        "size": 1540
      },
      {
        "fileName": "0aa518d0-450c-4337-984b-1efad25253d4(2).png",
        "confidence": 0.7,
        "size": 11394
      },
      {
        "fileName": "0aa518d0-450c-4337-984b-1efad25253d4.png",
        "confidence": 0.7,
        "size": 1172
      },
      {
        "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a(2).png",
        "confidence": 0.7,
        "size": 11988
      },
      {
        "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a.png",
        "confidence": 0.7,
        "size": 1314
      },
      {
        "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f(2).png",
        "confidence": 0.7,
        "size": 16720
      },
      {
        "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f.png",
        "confidence": 0.7,
        "size": 1648
      },
      {
        "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98(2).png",
        "confidence": 0.7,
        "size": 15966
      },
      {
        "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png",
        "confidence": 0.7,
        "size": 1394
      },
      {
        "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa(2).png",
        "confidence": 0.7,
        "size": 16800
      },
      {
        "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa.png",
        "confidence": 0.7,
        "size": 1528
      },
      {
        "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed(2).png",
        "confidence": 0.7,
        "size": 12832
      },
      {
        "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed.png",
        "confidence": 0.7,
        "size": 1474
      },
      {
        "fileName": "1639d850-a711-4215-9f80-335697f71e57(2).png",
        "confidence": 0.7,
        "size": 15382
      },
      {
        "fileName": "1639d850-a711-4215-9f80-335697f71e57.png",
        "confidence": 0.7,
        "size": 1474
      },
      {
        "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png",
        "confidence": 0.7,
        "size": 7020
      },
      {
        "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png",
        "confidence": 0.7,
        "size": 1046
      },
      {
        "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2(2).png",
        "confidence": 0.7,
        "size": 5638
      },
      {
        "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2.png",
        "confidence": 0.7,
        "size": 694
      },
      {
        "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd(2).png",
        "confidence": 0.7,
        "size": 7112
      },
      {
        "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd.png",
        "confidence": 0.7,
        "size": 714
      },
      {
        "fileName": "239d3751-e13c-4c3f-91db-ece731449203(2).png",
        "confidence": 0.7,
        "size": 6046
      },
      {
        "fileName": "239d3751-e13c-4c3f-91db-ece731449203.png",
        "confidence": 0.7,
        "size": 834
      },
      {
        "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88(2).png",
        "confidence": 0.7,
        "size": 16350
      },
      {
        "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88.png",
        "confidence": 0.7,
        "size": 1702
      },
      {
        "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb(2).png",
        "confidence": 0.7,
        "size": 14646
      },
      {
        "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb.png",
        "confidence": 0.7,
        "size": 1420
      },
      {
        "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6(2).png",
        "confidence": 0.7,
        "size": 10688
      },
      {
        "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6.png",
        "confidence": 0.7,
        "size": 1350
      },
      {
        "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(2).png",
        "confidence": 0.7,
        "size": 13444
      },
      {
        "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8.png",
        "confidence": 0.7,
        "size": 1546
      },
      {
        "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8(2).png",
        "confidence": 0.7,
        "size": 13176
      },
      {
        "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8.png",
        "confidence": 0.7,
        "size": 1256
      },
      {
        "fileName": "285e6817-9453-4663-98ca-599e602e29b1(2).png",
        "confidence": 0.7,
        "size": 7738
      },
      {
        "fileName": "285e6817-9453-4663-98ca-599e602e29b1.png",
        "confidence": 0.7,
        "size": 884
      },
      {
        "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d(2).png",
        "confidence": 0.7,
        "size": 11768
      },
      {
        "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d.png",
        "confidence": 0.7,
        "size": 1068
      },
      {
        "fileName": "2be10054-248f-433b-b223-3adc09e89f53(2).png",
        "confidence": 0.7,
        "size": 16130
      },
      {
        "fileName": "2be10054-248f-433b-b223-3adc09e89f53.png",
        "confidence": 0.7,
        "size": 1598
      },
      {
        "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4(2).png",
        "confidence": 0.7,
        "size": 9464
      },
      {
        "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4.png",
        "confidence": 0.7,
        "size": 1944
      },
      {
        "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066(2).png",
        "confidence": 0.7,
        "size": 12704
      },
      {
        "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066.png",
        "confidence": 0.7,
        "size": 1146
      },
      {
        "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a(2).png",
        "confidence": 0.7,
        "size": 19894
      },
      {
        "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a.png",
        "confidence": 0.7,
        "size": 1152
      },
      {
        "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19(2).png",
        "confidence": 0.7,
        "size": 21552
      },
      {
        "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19.png",
        "confidence": 0.7,
        "size": 1938
      },
      {
        "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618(2).png",
        "confidence": 0.7,
        "size": 8830
      },
      {
        "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618.png",
        "confidence": 0.7,
        "size": 958
      },
      {
        "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831(2).png",
        "confidence": 0.7,
        "size": 11268
      },
      {
        "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831.png",
        "confidence": 0.7,
        "size": 1272
      },
      {
        "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(2).png",
        "confidence": 0.7,
        "size": 9128
      },
      {
        "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b.png",
        "confidence": 0.7,
        "size": 902
      },
      {
        "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115(2).png",
        "confidence": 0.7,
        "size": 14522
      },
      {
        "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115.png",
        "confidence": 0.7,
        "size": 1060
      },
      {
        "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d(2).png",
        "confidence": 0.7,
        "size": 6838
      },
      {
        "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d.png",
        "confidence": 0.7,
        "size": 798
      },
      {
        "fileName": "3b85c55c-c6ab-4c39-97c7-7b154ea64f5a(1).png",
        "confidence": 0.7,
        "size": 7966
      },
      {
        "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949(2).png",
        "confidence": 0.7,
        "size": 8824
      },
      {
        "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949.png",
        "confidence": 0.7,
        "size": 994
      },
      {
        "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1(2).png",
        "confidence": 0.7,
        "size": 17674
      },
      {
        "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1.png",
        "confidence": 0.7,
        "size": 1414
      },
      {
        "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b(2).png",
        "confidence": 0.7,
        "size": 15448
      },
      {
        "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b.png",
        "confidence": 0.7,
        "size": 1404
      },
      {
        "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712(2).png",
        "confidence": 0.7,
        "size": 13292
      },
      {
        "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712.png",
        "confidence": 0.7,
        "size": 1106
      },
      {
        "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08(2).png",
        "confidence": 0.7,
        "size": 8268
      },
      {
        "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08.png",
        "confidence": 0.7,
        "size": 788
      },
      {
        "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e(2).png",
        "confidence": 0.7,
        "size": 13618
      },
      {
        "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e.png",
        "confidence": 0.7,
        "size": 1410
      },
      {
        "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8(2).png",
        "confidence": 0.7,
        "size": 10788
      },
      {
        "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8.png",
        "confidence": 0.7,
        "size": 1188
      },
      {
        "fileName": "4b985711-8703-4729-93a1-06d9186e42b6(2).png",
        "confidence": 0.7,
        "size": 9016
      },
      {
        "fileName": "4b985711-8703-4729-93a1-06d9186e42b6.png",
        "confidence": 0.7,
        "size": 652
      },
      {
        "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3(2).png",
        "confidence": 0.7,
        "size": 5844
      },
      {
        "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3.png",
        "confidence": 0.7,
        "size": 566
      },
      {
        "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(2).png",
        "confidence": 0.7,
        "size": 11106
      },
      {
        "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93.png",
        "confidence": 0.7,
        "size": 740
      },
      {
        "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7(2).png",
        "confidence": 0.7,
        "size": 6646
      },
      {
        "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7.png",
        "confidence": 0.7,
        "size": 542
      },
      {
        "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2(2).png",
        "confidence": 0.7,
        "size": 7480
      },
      {
        "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2.png",
        "confidence": 0.7,
        "size": 772
      },
      {
        "fileName": "5122054d-82ae-4eca-948a-7c856a70e435(2).png",
        "confidence": 0.7,
        "size": 10262
      },
      {
        "fileName": "5122054d-82ae-4eca-948a-7c856a70e435.png",
        "confidence": 0.7,
        "size": 1088
      },
      {
        "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6(2).png",
        "confidence": 0.7,
        "size": 14322
      },
      {
        "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6.png",
        "confidence": 0.7,
        "size": 1580
      },
      {
        "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70(2).png",
        "confidence": 0.7,
        "size": 14242
      },
      {
        "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70.png",
        "confidence": 0.7,
        "size": 1566
      },
      {
        "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963(2).png",
        "confidence": 0.7,
        "size": 5730
      },
      {
        "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963.png",
        "confidence": 0.7,
        "size": 586
      },
      {
        "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9(2).png",
        "confidence": 0.7,
        "size": 13598
      },
      {
        "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9.png",
        "confidence": 0.7,
        "size": 1304
      },
      {
        "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82(2).png",
        "confidence": 0.7,
        "size": 12694
      },
      {
        "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82.png",
        "confidence": 0.7,
        "size": 1394
      },
      {
        "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac(2).png",
        "confidence": 0.7,
        "size": 13924
      },
      {
        "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac.png",
        "confidence": 0.7,
        "size": 1188
      },
      {
        "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794(2).png",
        "confidence": 0.7,
        "size": 10116
      },
      {
        "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794.png",
        "confidence": 0.7,
        "size": 786
      },
      {
        "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b(2).png",
        "confidence": 0.7,
        "size": 8518
      },
      {
        "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b.png",
        "confidence": 0.7,
        "size": 806
      },
      {
        "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4(2).png",
        "confidence": 0.7,
        "size": 14848
      },
      {
        "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4.png",
        "confidence": 0.7,
        "size": 1286
      },
      {
        "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a(2).png",
        "confidence": 0.7,
        "size": 13856
      },
      {
        "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a.png",
        "confidence": 0.7,
        "size": 1524
      },
      {
        "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7(2).png",
        "confidence": 0.7,
        "size": 12722
      },
      {
        "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7.png",
        "confidence": 0.7,
        "size": 1236
      },
      {
        "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd(2).png",
        "confidence": 0.7,
        "size": 16058
      },
      {
        "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd.png",
        "confidence": 0.7,
        "size": 1458
      },
      {
        "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68(2).png",
        "confidence": 0.7,
        "size": 13436
      },
      {
        "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68.png",
        "confidence": 0.7,
        "size": 1290
      },
      {
        "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9(2).png",
        "confidence": 0.7,
        "size": 12992
      },
      {
        "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9.png",
        "confidence": 0.7,
        "size": 1282
      },
      {
        "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(2).png",
        "confidence": 0.7,
        "size": 8714
      },
      {
        "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1.png",
        "confidence": 0.7,
        "size": 1112
      },
      {
        "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6(2).png",
        "confidence": 0.7,
        "size": 12476
      },
      {
        "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6.png",
        "confidence": 0.7,
        "size": 1478
      },
      {
        "fileName": "7288ca44-2d97-448e-af22-a5a07734562f(2).png",
        "confidence": 0.7,
        "size": 8622
      },
      {
        "fileName": "7288ca44-2d97-448e-af22-a5a07734562f.png",
        "confidence": 0.7,
        "size": 946
      },
      {
        "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39(2).png",
        "confidence": 0.7,
        "size": 13370
      },
      {
        "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39.png",
        "confidence": 0.7,
        "size": 1310
      },
      {
        "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b(2).png",
        "confidence": 0.7,
        "size": 7306
      },
      {
        "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b.png",
        "confidence": 0.7,
        "size": 1036
      },
      {
        "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede(2).png",
        "confidence": 0.7,
        "size": 8784
      },
      {
        "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede.png",
        "confidence": 0.7,
        "size": 980
      },
      {
        "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d(2).png",
        "confidence": 0.7,
        "size": 9252
      },
      {
        "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d.png",
        "confidence": 0.7,
        "size": 938
      },
      {
        "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029(2).png",
        "confidence": 0.7,
        "size": 11666
      },
      {
        "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029.png",
        "confidence": 0.7,
        "size": 1220
      },
      {
        "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(2).png",
        "confidence": 0.7,
        "size": 15134
      },
      {
        "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d.png",
        "confidence": 0.7,
        "size": 1514
      },
      {
        "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(2).png",
        "confidence": 0.7,
        "size": 14076
      },
      {
        "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a.png",
        "confidence": 0.7,
        "size": 1206
      },
      {
        "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(2).png",
        "confidence": 0.7,
        "size": 14084
      },
      {
        "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1.png",
        "confidence": 0.7,
        "size": 1490
      },
      {
        "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(2).png",
        "confidence": 0.7,
        "size": 12016
      },
      {
        "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335.png",
        "confidence": 0.7,
        "size": 1390
      },
      {
        "fileName": "809723b7-130e-478c-9b54-fe40739a1eee(2).png",
        "confidence": 0.7,
        "size": 8812
      },
      {
        "fileName": "809723b7-130e-478c-9b54-fe40739a1eee.png",
        "confidence": 0.7,
        "size": 672
      },
      {
        "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124(2).png",
        "confidence": 0.7,
        "size": 5268
      },
      {
        "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124.png",
        "confidence": 0.7,
        "size": 336
      },
      {
        "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b(2).png",
        "confidence": 0.7,
        "size": 14734
      },
      {
        "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b.png",
        "confidence": 0.7,
        "size": 1280
      },
      {
        "fileName": "86e394a7-f886-4abd-9b19-72301c36a392(2).png",
        "confidence": 0.7,
        "size": 7100
      },
      {
        "fileName": "86e394a7-f886-4abd-9b19-72301c36a392.png",
        "confidence": 0.7,
        "size": 644
      },
      {
        "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4(2).png",
        "confidence": 0.7,
        "size": 13404
      },
      {
        "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4.png",
        "confidence": 0.7,
        "size": 1098
      },
      {
        "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(2).png",
        "confidence": 0.7,
        "size": 11740
      },
      {
        "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4.png",
        "confidence": 0.7,
        "size": 1156
      },
      {
        "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f(2).png",
        "confidence": 0.7,
        "size": 7520
      },
      {
        "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f.png",
        "confidence": 0.7,
        "size": 1128
      },
      {
        "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e(2).png",
        "confidence": 0.7,
        "size": 7980
      },
      {
        "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e.png",
        "confidence": 0.7,
        "size": 806
      },
      {
        "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c(2).png",
        "confidence": 0.7,
        "size": 11992
      },
      {
        "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c.png",
        "confidence": 0.7,
        "size": 1420
      },
      {
        "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d(2).png",
        "confidence": 0.7,
        "size": 11942
      },
      {
        "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d.png",
        "confidence": 0.7,
        "size": 996
      },
      {
        "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa(2).png",
        "confidence": 0.7,
        "size": 14170
      },
      {
        "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa.png",
        "confidence": 0.7,
        "size": 1140
      },
      {
        "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff(2).png",
        "confidence": 0.7,
        "size": 12346
      },
      {
        "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff.png",
        "confidence": 0.7,
        "size": 1286
      },
      {
        "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561(2).png",
        "confidence": 0.7,
        "size": 13408
      },
      {
        "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561.png",
        "confidence": 0.7,
        "size": 1388
      },
      {
        "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3(2).png",
        "confidence": 0.7,
        "size": 8686
      },
      {
        "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3.png",
        "confidence": 0.7,
        "size": 1020
      },
      {
        "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562(2).png",
        "confidence": 0.7,
        "size": 19130
      },
      {
        "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562.png",
        "confidence": 0.7,
        "size": 1570
      },
      {
        "fileName": "9b437738-8336-4c90-ae33-87d43225bae7(2).png",
        "confidence": 0.7,
        "size": 9914
      },
      {
        "fileName": "9b437738-8336-4c90-ae33-87d43225bae7.png",
        "confidence": 0.7,
        "size": 1006
      },
      {
        "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a(2).png",
        "confidence": 0.7,
        "size": 6386
      },
      {
        "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a.png",
        "confidence": 0.7,
        "size": 588
      },
      {
        "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(2).png",
        "confidence": 0.7,
        "size": 8264
      },
      {
        "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a.png",
        "confidence": 0.7,
        "size": 1058
      },
      {
        "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(2).png",
        "confidence": 0.7,
        "size": 3342
      },
      {
        "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217.png",
        "confidence": 0.7,
        "size": 652
      },
      {
        "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720(2).png",
        "confidence": 0.7,
        "size": 13708
      },
      {
        "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720.png",
        "confidence": 0.7,
        "size": 1480
      },
      {
        "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5(2).png",
        "confidence": 0.7,
        "size": 12212
      },
      {
        "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5.png",
        "confidence": 0.7,
        "size": 1178
      },
      {
        "fileName": "a5f17821-366d-43b5-86e3-a9e712032684(2).png",
        "confidence": 0.7,
        "size": 14926
      },
      {
        "fileName": "a5f17821-366d-43b5-86e3-a9e712032684.png",
        "confidence": 0.7,
        "size": 1400
      },
      {
        "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e(2).png",
        "confidence": 0.7,
        "size": 7044
      },
      {
        "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e.png",
        "confidence": 0.7,
        "size": 630
      },
      {
        "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(2).png",
        "confidence": 0.7,
        "size": 7144
      },
      {
        "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19.png",
        "confidence": 0.7,
        "size": 704
      },
      {
        "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558(2).png",
        "confidence": 0.7,
        "size": 6954
      },
      {
        "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558.png",
        "confidence": 0.7,
        "size": 690
      },
      {
        "fileName": "b324bc6d-6cf2-4542-aa05-424191416330(2).png",
        "confidence": 0.7,
        "size": 13286
      },
      {
        "fileName": "b324bc6d-6cf2-4542-aa05-424191416330.png",
        "confidence": 0.7,
        "size": 1320
      },
      {
        "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f(2).png",
        "confidence": 0.7,
        "size": 7728
      },
      {
        "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f.png",
        "confidence": 0.7,
        "size": 868
      },
      {
        "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(2).png",
        "confidence": 0.7,
        "size": 7308
      },
      {
        "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12.png",
        "confidence": 0.7,
        "size": 744
      },
      {
        "fileName": "b83537c4-4315-4f1e-9970-b0416829e686(2).png",
        "confidence": 0.7,
        "size": 6648
      },
      {
        "fileName": "b83537c4-4315-4f1e-9970-b0416829e686.png",
        "confidence": 0.7,
        "size": 974
      },
      {
        "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8(2).png",
        "confidence": 0.7,
        "size": 15050
      },
      {
        "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8.png",
        "confidence": 0.7,
        "size": 1480
      },
      {
        "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(2).png",
        "confidence": 0.7,
        "size": 13654
      },
      {
        "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea.png",
        "confidence": 0.7,
        "size": 1538
      },
      {
        "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2(2).png",
        "confidence": 0.7,
        "size": 12922
      },
      {
        "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2.png",
        "confidence": 0.7,
        "size": 1372
      },
      {
        "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(2).png",
        "confidence": 0.7,
        "size": 13286
      },
      {
        "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63.png",
        "confidence": 0.7,
        "size": 1356
      },
      {
        "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7(2).png",
        "confidence": 0.7,
        "size": 20330
      },
      {
        "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7.png",
        "confidence": 0.7,
        "size": 1598
      },
      {
        "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc(2).png",
        "confidence": 0.7,
        "size": 9884
      },
      {
        "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc.png",
        "confidence": 0.7,
        "size": 986
      },
      {
        "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697(2).png",
        "confidence": 0.7,
        "size": 8620
      },
      {
        "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697.png",
        "confidence": 0.7,
        "size": 960
      },
      {
        "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(2).png",
        "confidence": 0.7,
        "size": 11466
      },
      {
        "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33.png",
        "confidence": 0.7,
        "size": 790
      },
      {
        "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228(2).png",
        "confidence": 0.7,
        "size": 6676
      },
      {
        "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228.png",
        "confidence": 0.7,
        "size": 624
      },
      {
        "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982(2).png",
        "confidence": 0.7,
        "size": 14116
      },
      {
        "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982.png",
        "confidence": 0.7,
        "size": 1158
      },
      {
        "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(2).png",
        "confidence": 0.7,
        "size": 8940
      },
      {
        "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4.png",
        "confidence": 0.7,
        "size": 652
      },
      {
        "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(2).png",
        "confidence": 0.7,
        "size": 15944
      },
      {
        "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2.png",
        "confidence": 0.7,
        "size": 1392
      },
      {
        "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532(2).png",
        "confidence": 0.7,
        "size": 12718
      },
      {
        "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532.png",
        "confidence": 0.7,
        "size": 1066
      },
      {
        "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534(2).png",
        "confidence": 0.7,
        "size": 14112
      },
      {
        "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534.png",
        "confidence": 0.7,
        "size": 1442
      },
      {
        "fileName": "d59721da-fd82-4d32-805b-14377478bf3d(2).png",
        "confidence": 0.7,
        "size": 10674
      },
      {
        "fileName": "d59721da-fd82-4d32-805b-14377478bf3d.png",
        "confidence": 0.7,
        "size": 1358
      },
      {
        "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a(2).png",
        "confidence": 0.7,
        "size": 14126
      },
      {
        "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a.png",
        "confidence": 0.7,
        "size": 1254
      },
      {
        "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(2).png",
        "confidence": 0.7,
        "size": 12078
      },
      {
        "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad.png",
        "confidence": 0.7,
        "size": 1146
      },
      {
        "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125(2).png",
        "confidence": 0.7,
        "size": 10218
      },
      {
        "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125.png",
        "confidence": 0.7,
        "size": 1272
      },
      {
        "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827(2).png",
        "confidence": 0.7,
        "size": 5972
      },
      {
        "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827.png",
        "confidence": 0.7,
        "size": 566
      },
      {
        "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b(2).png",
        "confidence": 0.7,
        "size": 5756
      },
      {
        "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b.png",
        "confidence": 0.7,
        "size": 546
      },
      {
        "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(2).png",
        "confidence": 0.7,
        "size": 8930
      },
      {
        "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19.png",
        "confidence": 0.7,
        "size": 1142
      },
      {
        "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a(2).png",
        "confidence": 0.7,
        "size": 8916
      },
      {
        "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a.png",
        "confidence": 0.7,
        "size": 1168
      },
      {
        "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e(2).png",
        "confidence": 0.7,
        "size": 15224
      },
      {
        "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e.png",
        "confidence": 0.7,
        "size": 1852
      },
      {
        "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(2).png",
        "confidence": 0.7,
        "size": 9610
      },
      {
        "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141.png",
        "confidence": 0.7,
        "size": 1052
      },
      {
        "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a(2).png",
        "confidence": 0.7,
        "size": 15976
      },
      {
        "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a.png",
        "confidence": 0.7,
        "size": 1706
      },
      {
        "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(2).png",
        "confidence": 0.7,
        "size": 10684
      },
      {
        "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c.png",
        "confidence": 0.7,
        "size": 740
      },
      {
        "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b(2).png",
        "confidence": 0.7,
        "size": 13028
      },
      {
        "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b.png",
        "confidence": 0.7,
        "size": 1524
      },
      {
        "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(2).png",
        "confidence": 0.7,
        "size": 5264
      },
      {
        "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f.png",
        "confidence": 0.7,
        "size": 398
      },
      {
        "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14(2).png",
        "confidence": 0.7,
        "size": 15184
      },
      {
        "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14.png",
        "confidence": 0.7,
        "size": 1188
      },
      {
        "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b(2).png",
        "confidence": 0.7,
        "size": 15962
      },
      {
        "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b.png",
        "confidence": 0.7,
        "size": 1626
      },
      {
        "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d(2).png",
        "confidence": 0.7,
        "size": 12650
      },
      {
        "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d.png",
        "confidence": 0.7,
        "size": 1290
      },
      {
        "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b(2).png",
        "confidence": 0.7,
        "size": 5124
      },
      {
        "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b.png",
        "confidence": 0.7,
        "size": 534
      },
      {
        "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(2).png",
        "confidence": 0.7,
        "size": 15694
      },
      {
        "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4.png",
        "confidence": 0.7,
        "size": 1740
      },
      {
        "fileName": "f24b1997-8258-4300-8899-df366565c4e0(2).png",
        "confidence": 0.7,
        "size": 13080
      },
      {
        "fileName": "f24b1997-8258-4300-8899-df366565c4e0.png",
        "confidence": 0.7,
        "size": 1284
      },
      {
        "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d(2).png",
        "confidence": 0.7,
        "size": 11568
      },
      {
        "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d.png",
        "confidence": 0.7,
        "size": 1100
      },
      {
        "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a(2).png",
        "confidence": 0.7,
        "size": 7674
      },
      {
        "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a.png",
        "confidence": 0.7,
        "size": 782
      },
      {
        "fileName": "lovart-avatar.png",
        "confidence": 0.7,
        "size": 1514
      }
    ],
    "ui-interface": [
      {
        "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a(1).png",
        "confidence": 0.7,
        "size": 930472
      },
      {
        "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png",
        "confidence": 0.7,
        "size": 841027
      },
      {
        "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png",
        "confidence": 0.7,
        "size": 905474
      },
      {
        "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png",
        "confidence": 0.7,
        "size": 1002811
      },
      {
        "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa(1).png",
        "confidence": 0.7,
        "size": 885508
      },
      {
        "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88(1).png",
        "confidence": 0.7,
        "size": 828537
      },
      {
        "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb(1).png",
        "confidence": 0.7,
        "size": 883892
      },
      {
        "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a(1).png",
        "confidence": 0.7,
        "size": 1057423
      },
      {
        "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19(1).png",
        "confidence": 0.7,
        "size": 858146
      },
      {
        "fileName": "3b85c55c-c6ab-4c39-97c7-7b154ea64f5a.png",
        "confidence": 0.7,
        "size": 1075094
      },
      {
        "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1(1).png",
        "confidence": 0.7,
        "size": 896327
      },
      {
        "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70(1).png",
        "confidence": 0.7,
        "size": 957441
      },
      {
        "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9(1).png",
        "confidence": 0.7,
        "size": 915955
      },
      {
        "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac(1).png",
        "confidence": 0.7,
        "size": 898330
      },
      {
        "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede(1).png",
        "confidence": 0.7,
        "size": 837956
      },
      {
        "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(1).png",
        "confidence": 0.7,
        "size": 808359
      },
      {
        "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(1).png",
        "confidence": 0.7,
        "size": 913011
      },
      {
        "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b(1).png",
        "confidence": 0.7,
        "size": 804575
      },
      {
        "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561(1).png",
        "confidence": 0.7,
        "size": 800261
      },
      {
        "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562(1).png",
        "confidence": 0.7,
        "size": 1052903
      },
      {
        "fileName": "a5f17821-366d-43b5-86e3-a9e712032684(1).png",
        "confidence": 0.7,
        "size": 829643
      },
      {
        "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f(1).png",
        "confidence": 0.7,
        "size": 811308
      },
      {
        "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(1).png",
        "confidence": 0.7,
        "size": 891969
      },
      {
        "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7(1).png",
        "confidence": 0.7,
        "size": 1128219
      },
      {
        "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228(1).png",
        "confidence": 0.7,
        "size": 1059292
      },
      {
        "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534(1).png",
        "confidence": 0.7,
        "size": 860133
      },
      {
        "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a(1).png",
        "confidence": 0.7,
        "size": 830852
      },
      {
        "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(1).png",
        "confidence": 0.7,
        "size": 808921
      },
      {
        "fileName": "f24b1997-8258-4300-8899-df366565c4e0(1).png",
        "confidence": 0.7,
        "size": 812988
      }
    ],
    "icon-sets": [
      {
        "fileName": "9666dcc96aaac0ce6cf4a11b5a80ddaf0056f46d.png",
        "confidence": 0.7,
        "size": 99190
      },
      {
        "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(1).png",
        "confidence": 0.7,
        "size": 258741
      },
      {
        "fileName": "9f1c7af1171478b0a972190c9e3f2dbd4583b77a.png",
        "confidence": 0.7,
        "size": 100323
      }
    ]
  },
  "themes": {
    "modern": [
      {
        "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0aa518d0-450c-4337-984b-1efad25253d4(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "0aa518d0-450c-4337-984b-1efad25253d4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0aa518d0-450c-4337-984b-1efad25253d4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1639d850-a711-4215-9f80-335697f71e57(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "1639d850-a711-4215-9f80-335697f71e57(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1639d850-a711-4215-9f80-335697f71e57.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "239d3751-e13c-4c3f-91db-ece731449203(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "239d3751-e13c-4c3f-91db-ece731449203(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "239d3751-e13c-4c3f-91db-ece731449203.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "285e6817-9453-4663-98ca-599e602e29b1(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "285e6817-9453-4663-98ca-599e602e29b1(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "285e6817-9453-4663-98ca-599e602e29b1.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2be10054-248f-433b-b223-3adc09e89f53(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "2be10054-248f-433b-b223-3adc09e89f53(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2be10054-248f-433b-b223-3adc09e89f53.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3b85c55c-c6ab-4c39-97c7-7b154ea64f5a(1).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3b85c55c-c6ab-4c39-97c7-7b154ea64f5a.png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4b985711-8703-4729-93a1-06d9186e42b6(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "4b985711-8703-4729-93a1-06d9186e42b6(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4b985711-8703-4729-93a1-06d9186e42b6.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5122054d-82ae-4eca-948a-7c856a70e435(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "5122054d-82ae-4eca-948a-7c856a70e435(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5122054d-82ae-4eca-948a-7c856a70e435.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7288ca44-2d97-448e-af22-a5a07734562f(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "7288ca44-2d97-448e-af22-a5a07734562f(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7288ca44-2d97-448e-af22-a5a07734562f.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "809723b7-130e-478c-9b54-fe40739a1eee(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "809723b7-130e-478c-9b54-fe40739a1eee(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "809723b7-130e-478c-9b54-fe40739a1eee.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "86e394a7-f886-4abd-9b19-72301c36a392(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "86e394a7-f886-4abd-9b19-72301c36a392(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "86e394a7-f886-4abd-9b19-72301c36a392.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9666dcc96aaac0ce6cf4a11b5a80ddaf0056f46d.png",
        "category": "icon-sets",
        "confidence": 0.7
      },
      {
        "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9b437738-8336-4c90-ae33-87d43225bae7(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9b437738-8336-4c90-ae33-87d43225bae7(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9b437738-8336-4c90-ae33-87d43225bae7.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(1).png",
        "category": "icon-sets",
        "confidence": 0.7
      },
      {
        "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9f1c7af1171478b0a972190c9e3f2dbd4583b77a.png",
        "category": "icon-sets",
        "confidence": 0.7
      },
      {
        "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "a5f17821-366d-43b5-86e3-a9e712032684(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "a5f17821-366d-43b5-86e3-a9e712032684(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "a5f17821-366d-43b5-86e3-a9e712032684.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b324bc6d-6cf2-4542-aa05-424191416330(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "b324bc6d-6cf2-4542-aa05-424191416330(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b324bc6d-6cf2-4542-aa05-424191416330.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b83537c4-4315-4f1e-9970-b0416829e686(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "b83537c4-4315-4f1e-9970-b0416829e686(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b83537c4-4315-4f1e-9970-b0416829e686.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d59721da-fd82-4d32-805b-14377478bf3d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "d59721da-fd82-4d32-805b-14377478bf3d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d59721da-fd82-4d32-805b-14377478bf3d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "f24b1997-8258-4300-8899-df366565c4e0(1).png",
        "category": "ui-interface",
        "confidence": 0.7
      },
      {
        "fileName": "f24b1997-8258-4300-8899-df366565c4e0(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "f24b1997-8258-4300-8899-df366565c4e0.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a(1).png",
        "category": "components",
        "confidence": 0.7
      },
      {
        "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a(2).png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a.png",
        "category": "icons",
        "confidence": 0.7
      },
      {
        "fileName": "lovart-avatar.png",
        "category": "icons",
        "confidence": 0.7
      }
    ]
  },
  "confidence": {
    "high": 0,
    "medium": 422,
    "low": 0
  },
  "files": [
    {
      "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7(1).png",
      "originalPath": "Lovart\\006c8387-5285-4e59-84a7-adb96b3d96a7(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 593666,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/006c8387-5285-4e59-84a7-adb96b3d96a7(1).png"
    },
    {
      "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7(2).png",
      "originalPath": "Lovart\\006c8387-5285-4e59-84a7-adb96b3d96a7(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6540,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/006c8387-5285-4e59-84a7-adb96b3d96a7(2).png"
    },
    {
      "fileName": "006c8387-5285-4e59-84a7-adb96b3d96a7.png",
      "originalPath": "Lovart\\006c8387-5285-4e59-84a7-adb96b3d96a7.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 714,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/006c8387-5285-4e59-84a7-adb96b3d96a7.png"
    },
    {
      "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png",
      "originalPath": "Lovart\\038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 668029,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/038bf7a8-4966-452d-8c6c-fe78a9bf0e86(1).png"
    },
    {
      "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png",
      "originalPath": "Lovart\\038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11968,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/038bf7a8-4966-452d-8c6c-fe78a9bf0e86(2).png"
    },
    {
      "fileName": "038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png",
      "originalPath": "Lovart\\038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1144,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/038bf7a8-4966-452d-8c6c-fe78a9bf0e86.png"
    },
    {
      "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959(1).png",
      "originalPath": "Lovart\\042f185c-e76a-429e-b9ef-25f5e6745959(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 700797,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/042f185c-e76a-429e-b9ef-25f5e6745959(1).png"
    },
    {
      "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959(2).png",
      "originalPath": "Lovart\\042f185c-e76a-429e-b9ef-25f5e6745959(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12518,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/042f185c-e76a-429e-b9ef-25f5e6745959(2).png"
    },
    {
      "fileName": "042f185c-e76a-429e-b9ef-25f5e6745959.png",
      "originalPath": "Lovart\\042f185c-e76a-429e-b9ef-25f5e6745959.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1494,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/042f185c-e76a-429e-b9ef-25f5e6745959.png"
    },
    {
      "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a(1).png",
      "originalPath": "Lovart\\0467120e-fecf-4833-bab4-b92b8aa7102a(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 930472,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/0467120e-fecf-4833-bab4-b92b8aa7102a(1).png"
    },
    {
      "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a(2).png",
      "originalPath": "Lovart\\0467120e-fecf-4833-bab4-b92b8aa7102a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15574,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0467120e-fecf-4833-bab4-b92b8aa7102a(2).png"
    },
    {
      "fileName": "0467120e-fecf-4833-bab4-b92b8aa7102a.png",
      "originalPath": "Lovart\\0467120e-fecf-4833-bab4-b92b8aa7102a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1514,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0467120e-fecf-4833-bab4-b92b8aa7102a.png"
    },
    {
      "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png",
      "originalPath": "Lovart\\054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 841027,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/054b05e8-fda6-4bc0-862d-eb2fddf5412c(1).png"
    },
    {
      "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png",
      "originalPath": "Lovart\\054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11148,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/054b05e8-fda6-4bc0-862d-eb2fddf5412c(2).png"
    },
    {
      "fileName": "054b05e8-fda6-4bc0-862d-eb2fddf5412c.png",
      "originalPath": "Lovart\\054b05e8-fda6-4bc0-862d-eb2fddf5412c.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1178,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/054b05e8-fda6-4bc0-862d-eb2fddf5412c.png"
    },
    {
      "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png",
      "originalPath": "Lovart\\07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 792145,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(1).png"
    },
    {
      "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(2).png",
      "originalPath": "Lovart\\07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 19066,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d(2).png"
    },
    {
      "fileName": "07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d.png",
      "originalPath": "Lovart\\07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1664,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/07db38d9-d7d8-407f-9be6-d6d8ea1aaa3d.png"
    },
    {
      "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048(1).png",
      "originalPath": "Lovart\\09d65e82-3492-45e0-975a-4378ecfc4048(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 669842,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/09d65e82-3492-45e0-975a-4378ecfc4048(1).png"
    },
    {
      "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048(2).png",
      "originalPath": "Lovart\\09d65e82-3492-45e0-975a-4378ecfc4048(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12122,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/09d65e82-3492-45e0-975a-4378ecfc4048(2).png"
    },
    {
      "fileName": "09d65e82-3492-45e0-975a-4378ecfc4048.png",
      "originalPath": "Lovart\\09d65e82-3492-45e0-975a-4378ecfc4048.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1540,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/09d65e82-3492-45e0-975a-4378ecfc4048.png"
    },
    {
      "fileName": "0aa518d0-450c-4337-984b-1efad25253d4(1).png",
      "originalPath": "Lovart\\0aa518d0-450c-4337-984b-1efad25253d4(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 686947,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/0aa518d0-450c-4337-984b-1efad25253d4(1).png"
    },
    {
      "fileName": "0aa518d0-450c-4337-984b-1efad25253d4(2).png",
      "originalPath": "Lovart\\0aa518d0-450c-4337-984b-1efad25253d4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11394,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0aa518d0-450c-4337-984b-1efad25253d4(2).png"
    },
    {
      "fileName": "0aa518d0-450c-4337-984b-1efad25253d4.png",
      "originalPath": "Lovart\\0aa518d0-450c-4337-984b-1efad25253d4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1172,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0aa518d0-450c-4337-984b-1efad25253d4.png"
    },
    {
      "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a(1).png",
      "originalPath": "Lovart\\0bc199bf-0e4e-43ba-b4b5-3482291efe5a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 708548,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/0bc199bf-0e4e-43ba-b4b5-3482291efe5a(1).png"
    },
    {
      "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a(2).png",
      "originalPath": "Lovart\\0bc199bf-0e4e-43ba-b4b5-3482291efe5a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11988,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0bc199bf-0e4e-43ba-b4b5-3482291efe5a(2).png"
    },
    {
      "fileName": "0bc199bf-0e4e-43ba-b4b5-3482291efe5a.png",
      "originalPath": "Lovart\\0bc199bf-0e4e-43ba-b4b5-3482291efe5a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1314,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0bc199bf-0e4e-43ba-b4b5-3482291efe5a.png"
    },
    {
      "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png",
      "originalPath": "Lovart\\0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 905474,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/0d5ccf94-742a-42c2-848d-fce3d26a312f(1).png"
    },
    {
      "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f(2).png",
      "originalPath": "Lovart\\0d5ccf94-742a-42c2-848d-fce3d26a312f(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 16720,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0d5ccf94-742a-42c2-848d-fce3d26a312f(2).png"
    },
    {
      "fileName": "0d5ccf94-742a-42c2-848d-fce3d26a312f.png",
      "originalPath": "Lovart\\0d5ccf94-742a-42c2-848d-fce3d26a312f.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1648,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0d5ccf94-742a-42c2-848d-fce3d26a312f.png"
    },
    {
      "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png",
      "originalPath": "Lovart\\0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 1002811,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/0d8ddb75-d08b-48c0-be15-127dfb7e9e98(1).png"
    },
    {
      "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98(2).png",
      "originalPath": "Lovart\\0d8ddb75-d08b-48c0-be15-127dfb7e9e98(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15966,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0d8ddb75-d08b-48c0-be15-127dfb7e9e98(2).png"
    },
    {
      "fileName": "0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png",
      "originalPath": "Lovart\\0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1394,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/0d8ddb75-d08b-48c0-be15-127dfb7e9e98.png"
    },
    {
      "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa(1).png",
      "originalPath": "Lovart\\114bf95c-312d-48f3-b51b-67f607d865aa(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 885508,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/114bf95c-312d-48f3-b51b-67f607d865aa(1).png"
    },
    {
      "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa(2).png",
      "originalPath": "Lovart\\114bf95c-312d-48f3-b51b-67f607d865aa(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 16800,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/114bf95c-312d-48f3-b51b-67f607d865aa(2).png"
    },
    {
      "fileName": "114bf95c-312d-48f3-b51b-67f607d865aa.png",
      "originalPath": "Lovart\\114bf95c-312d-48f3-b51b-67f607d865aa.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1528,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/114bf95c-312d-48f3-b51b-67f607d865aa.png"
    },
    {
      "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed(1).png",
      "originalPath": "Lovart\\1283c5cb-4606-41aa-8c11-759c95d755ed(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 696744,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/1283c5cb-4606-41aa-8c11-759c95d755ed(1).png"
    },
    {
      "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed(2).png",
      "originalPath": "Lovart\\1283c5cb-4606-41aa-8c11-759c95d755ed(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12832,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1283c5cb-4606-41aa-8c11-759c95d755ed(2).png"
    },
    {
      "fileName": "1283c5cb-4606-41aa-8c11-759c95d755ed.png",
      "originalPath": "Lovart\\1283c5cb-4606-41aa-8c11-759c95d755ed.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1474,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1283c5cb-4606-41aa-8c11-759c95d755ed.png"
    },
    {
      "fileName": "1639d850-a711-4215-9f80-335697f71e57(1).png",
      "originalPath": "Lovart\\1639d850-a711-4215-9f80-335697f71e57(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 776188,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/1639d850-a711-4215-9f80-335697f71e57(1).png"
    },
    {
      "fileName": "1639d850-a711-4215-9f80-335697f71e57(2).png",
      "originalPath": "Lovart\\1639d850-a711-4215-9f80-335697f71e57(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15382,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1639d850-a711-4215-9f80-335697f71e57(2).png"
    },
    {
      "fileName": "1639d850-a711-4215-9f80-335697f71e57.png",
      "originalPath": "Lovart\\1639d850-a711-4215-9f80-335697f71e57.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1474,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1639d850-a711-4215-9f80-335697f71e57.png"
    },
    {
      "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b(1).png",
      "originalPath": "Lovart\\17aaf1b8-5215-4cc8-99aa-0645625f0d5b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 642268,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/17aaf1b8-5215-4cc8-99aa-0645625f0d5b(1).png"
    },
    {
      "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png",
      "originalPath": "Lovart\\17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7020,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/17aaf1b8-5215-4cc8-99aa-0645625f0d5b(2).png"
    },
    {
      "fileName": "17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png",
      "originalPath": "Lovart\\17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1046,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/17aaf1b8-5215-4cc8-99aa-0645625f0d5b.png"
    },
    {
      "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2(1).png",
      "originalPath": "Lovart\\1a069307-0244-4e66-86bb-486727c8b1e2(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 434039,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/1a069307-0244-4e66-86bb-486727c8b1e2(1).png"
    },
    {
      "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2(2).png",
      "originalPath": "Lovart\\1a069307-0244-4e66-86bb-486727c8b1e2(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5638,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1a069307-0244-4e66-86bb-486727c8b1e2(2).png"
    },
    {
      "fileName": "1a069307-0244-4e66-86bb-486727c8b1e2.png",
      "originalPath": "Lovart\\1a069307-0244-4e66-86bb-486727c8b1e2.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 694,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1a069307-0244-4e66-86bb-486727c8b1e2.png"
    },
    {
      "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd(1).png",
      "originalPath": "Lovart\\1e2f3c9c-506c-4599-8735-06aea7aa21dd(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 569525,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/1e2f3c9c-506c-4599-8735-06aea7aa21dd(1).png"
    },
    {
      "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd(2).png",
      "originalPath": "Lovart\\1e2f3c9c-506c-4599-8735-06aea7aa21dd(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7112,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1e2f3c9c-506c-4599-8735-06aea7aa21dd(2).png"
    },
    {
      "fileName": "1e2f3c9c-506c-4599-8735-06aea7aa21dd.png",
      "originalPath": "Lovart\\1e2f3c9c-506c-4599-8735-06aea7aa21dd.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 714,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/1e2f3c9c-506c-4599-8735-06aea7aa21dd.png"
    },
    {
      "fileName": "239d3751-e13c-4c3f-91db-ece731449203(1).png",
      "originalPath": "Lovart\\239d3751-e13c-4c3f-91db-ece731449203(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 519334,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/239d3751-e13c-4c3f-91db-ece731449203(1).png"
    },
    {
      "fileName": "239d3751-e13c-4c3f-91db-ece731449203(2).png",
      "originalPath": "Lovart\\239d3751-e13c-4c3f-91db-ece731449203(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6046,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/239d3751-e13c-4c3f-91db-ece731449203(2).png"
    },
    {
      "fileName": "239d3751-e13c-4c3f-91db-ece731449203.png",
      "originalPath": "Lovart\\239d3751-e13c-4c3f-91db-ece731449203.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 834,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/239d3751-e13c-4c3f-91db-ece731449203.png"
    },
    {
      "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88(1).png",
      "originalPath": "Lovart\\23db9ea3-4a72-4667-a811-eaff4b34ed88(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 828537,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/23db9ea3-4a72-4667-a811-eaff4b34ed88(1).png"
    },
    {
      "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88(2).png",
      "originalPath": "Lovart\\23db9ea3-4a72-4667-a811-eaff4b34ed88(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 16350,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/23db9ea3-4a72-4667-a811-eaff4b34ed88(2).png"
    },
    {
      "fileName": "23db9ea3-4a72-4667-a811-eaff4b34ed88.png",
      "originalPath": "Lovart\\23db9ea3-4a72-4667-a811-eaff4b34ed88.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1702,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/23db9ea3-4a72-4667-a811-eaff4b34ed88.png"
    },
    {
      "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb(1).png",
      "originalPath": "Lovart\\25c52fb3-7911-4d5d-8b91-b0a23420fbfb(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 883892,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/25c52fb3-7911-4d5d-8b91-b0a23420fbfb(1).png"
    },
    {
      "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb(2).png",
      "originalPath": "Lovart\\25c52fb3-7911-4d5d-8b91-b0a23420fbfb(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14646,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/25c52fb3-7911-4d5d-8b91-b0a23420fbfb(2).png"
    },
    {
      "fileName": "25c52fb3-7911-4d5d-8b91-b0a23420fbfb.png",
      "originalPath": "Lovart\\25c52fb3-7911-4d5d-8b91-b0a23420fbfb.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1420,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/25c52fb3-7911-4d5d-8b91-b0a23420fbfb.png"
    },
    {
      "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6(1).png",
      "originalPath": "Lovart\\26360e34-6732-411a-b777-1fd9622e1bb6(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 619348,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/26360e34-6732-411a-b777-1fd9622e1bb6(1).png"
    },
    {
      "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6(2).png",
      "originalPath": "Lovart\\26360e34-6732-411a-b777-1fd9622e1bb6(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10688,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/26360e34-6732-411a-b777-1fd9622e1bb6(2).png"
    },
    {
      "fileName": "26360e34-6732-411a-b777-1fd9622e1bb6.png",
      "originalPath": "Lovart\\26360e34-6732-411a-b777-1fd9622e1bb6.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1350,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/26360e34-6732-411a-b777-1fd9622e1bb6.png"
    },
    {
      "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(1).png",
      "originalPath": "Lovart\\27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 781623,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(1).png"
    },
    {
      "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(2).png",
      "originalPath": "Lovart\\27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13444,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8(2).png"
    },
    {
      "fileName": "27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8.png",
      "originalPath": "Lovart\\27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1546,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/27dbd717-42f5-4ad1-962b-e0dd4c4ef7a8.png"
    },
    {
      "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8(1).png",
      "originalPath": "Lovart\\2824771b-f2dd-47cf-889b-f029bbaa76e8(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 696991,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/2824771b-f2dd-47cf-889b-f029bbaa76e8(1).png"
    },
    {
      "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8(2).png",
      "originalPath": "Lovart\\2824771b-f2dd-47cf-889b-f029bbaa76e8(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13176,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2824771b-f2dd-47cf-889b-f029bbaa76e8(2).png"
    },
    {
      "fileName": "2824771b-f2dd-47cf-889b-f029bbaa76e8.png",
      "originalPath": "Lovart\\2824771b-f2dd-47cf-889b-f029bbaa76e8.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1256,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2824771b-f2dd-47cf-889b-f029bbaa76e8.png"
    },
    {
      "fileName": "285e6817-9453-4663-98ca-599e602e29b1(1).png",
      "originalPath": "Lovart\\285e6817-9453-4663-98ca-599e602e29b1(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 563291,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/285e6817-9453-4663-98ca-599e602e29b1(1).png"
    },
    {
      "fileName": "285e6817-9453-4663-98ca-599e602e29b1(2).png",
      "originalPath": "Lovart\\285e6817-9453-4663-98ca-599e602e29b1(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7738,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/285e6817-9453-4663-98ca-599e602e29b1(2).png"
    },
    {
      "fileName": "285e6817-9453-4663-98ca-599e602e29b1.png",
      "originalPath": "Lovart\\285e6817-9453-4663-98ca-599e602e29b1.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 884,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/285e6817-9453-4663-98ca-599e602e29b1.png"
    },
    {
      "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d(1).png",
      "originalPath": "Lovart\\29a72b0a-15ed-4793-be6b-5a4a0949a72d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 627971,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/29a72b0a-15ed-4793-be6b-5a4a0949a72d(1).png"
    },
    {
      "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d(2).png",
      "originalPath": "Lovart\\29a72b0a-15ed-4793-be6b-5a4a0949a72d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11768,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/29a72b0a-15ed-4793-be6b-5a4a0949a72d(2).png"
    },
    {
      "fileName": "29a72b0a-15ed-4793-be6b-5a4a0949a72d.png",
      "originalPath": "Lovart\\29a72b0a-15ed-4793-be6b-5a4a0949a72d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1068,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/29a72b0a-15ed-4793-be6b-5a4a0949a72d.png"
    },
    {
      "fileName": "2be10054-248f-433b-b223-3adc09e89f53(1).png",
      "originalPath": "Lovart\\2be10054-248f-433b-b223-3adc09e89f53(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 670936,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/2be10054-248f-433b-b223-3adc09e89f53(1).png"
    },
    {
      "fileName": "2be10054-248f-433b-b223-3adc09e89f53(2).png",
      "originalPath": "Lovart\\2be10054-248f-433b-b223-3adc09e89f53(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 16130,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2be10054-248f-433b-b223-3adc09e89f53(2).png"
    },
    {
      "fileName": "2be10054-248f-433b-b223-3adc09e89f53.png",
      "originalPath": "Lovart\\2be10054-248f-433b-b223-3adc09e89f53.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1598,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2be10054-248f-433b-b223-3adc09e89f53.png"
    },
    {
      "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4(1).png",
      "originalPath": "Lovart\\2d96d13d-828a-4c1f-88d4-8f094240a5a4(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 437811,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/2d96d13d-828a-4c1f-88d4-8f094240a5a4(1).png"
    },
    {
      "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4(2).png",
      "originalPath": "Lovart\\2d96d13d-828a-4c1f-88d4-8f094240a5a4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9464,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2d96d13d-828a-4c1f-88d4-8f094240a5a4(2).png"
    },
    {
      "fileName": "2d96d13d-828a-4c1f-88d4-8f094240a5a4.png",
      "originalPath": "Lovart\\2d96d13d-828a-4c1f-88d4-8f094240a5a4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1944,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2d96d13d-828a-4c1f-88d4-8f094240a5a4.png"
    },
    {
      "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066(1).png",
      "originalPath": "Lovart\\2dac7146-e195-4fb5-a8c1-8ce9dbd93066(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 587994,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/2dac7146-e195-4fb5-a8c1-8ce9dbd93066(1).png"
    },
    {
      "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066(2).png",
      "originalPath": "Lovart\\2dac7146-e195-4fb5-a8c1-8ce9dbd93066(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12704,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2dac7146-e195-4fb5-a8c1-8ce9dbd93066(2).png"
    },
    {
      "fileName": "2dac7146-e195-4fb5-a8c1-8ce9dbd93066.png",
      "originalPath": "Lovart\\2dac7146-e195-4fb5-a8c1-8ce9dbd93066.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1146,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2dac7146-e195-4fb5-a8c1-8ce9dbd93066.png"
    },
    {
      "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a(1).png",
      "originalPath": "Lovart\\2dbc9555-3d61-4f66-ad72-9cfee9372d6a(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 1057423,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/2dbc9555-3d61-4f66-ad72-9cfee9372d6a(1).png"
    },
    {
      "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a(2).png",
      "originalPath": "Lovart\\2dbc9555-3d61-4f66-ad72-9cfee9372d6a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 19894,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2dbc9555-3d61-4f66-ad72-9cfee9372d6a(2).png"
    },
    {
      "fileName": "2dbc9555-3d61-4f66-ad72-9cfee9372d6a.png",
      "originalPath": "Lovart\\2dbc9555-3d61-4f66-ad72-9cfee9372d6a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1152,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/2dbc9555-3d61-4f66-ad72-9cfee9372d6a.png"
    },
    {
      "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19(1).png",
      "originalPath": "Lovart\\31fed23f-372d-43c0-bc4c-366d220c2f19(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 858146,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/31fed23f-372d-43c0-bc4c-366d220c2f19(1).png"
    },
    {
      "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19(2).png",
      "originalPath": "Lovart\\31fed23f-372d-43c0-bc4c-366d220c2f19(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 21552,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/31fed23f-372d-43c0-bc4c-366d220c2f19(2).png"
    },
    {
      "fileName": "31fed23f-372d-43c0-bc4c-366d220c2f19.png",
      "originalPath": "Lovart\\31fed23f-372d-43c0-bc4c-366d220c2f19.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1938,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/31fed23f-372d-43c0-bc4c-366d220c2f19.png"
    },
    {
      "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618(1).png",
      "originalPath": "Lovart\\32c55b88-bb84-4293-a8d0-1520b05d1618(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 607187,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/32c55b88-bb84-4293-a8d0-1520b05d1618(1).png"
    },
    {
      "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618(2).png",
      "originalPath": "Lovart\\32c55b88-bb84-4293-a8d0-1520b05d1618(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8830,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/32c55b88-bb84-4293-a8d0-1520b05d1618(2).png"
    },
    {
      "fileName": "32c55b88-bb84-4293-a8d0-1520b05d1618.png",
      "originalPath": "Lovart\\32c55b88-bb84-4293-a8d0-1520b05d1618.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 958,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/32c55b88-bb84-4293-a8d0-1520b05d1618.png"
    },
    {
      "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831(1).png",
      "originalPath": "Lovart\\347d0c0e-20e2-4f08-a70c-282feb888831(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 677580,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/347d0c0e-20e2-4f08-a70c-282feb888831(1).png"
    },
    {
      "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831(2).png",
      "originalPath": "Lovart\\347d0c0e-20e2-4f08-a70c-282feb888831(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11268,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/347d0c0e-20e2-4f08-a70c-282feb888831(2).png"
    },
    {
      "fileName": "347d0c0e-20e2-4f08-a70c-282feb888831.png",
      "originalPath": "Lovart\\347d0c0e-20e2-4f08-a70c-282feb888831.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1272,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/347d0c0e-20e2-4f08-a70c-282feb888831.png"
    },
    {
      "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(1).png",
      "originalPath": "Lovart\\351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 633407,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(1).png"
    },
    {
      "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(2).png",
      "originalPath": "Lovart\\351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9128,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b(2).png"
    },
    {
      "fileName": "351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b.png",
      "originalPath": "Lovart\\351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 902,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/351b3b44-fb3e-41b0-a0e2-c60e9ea28c8b.png"
    },
    {
      "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115(1).png",
      "originalPath": "Lovart\\35dcbd85-76bb-4aff-afc6-51b6abe90115(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 667942,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/35dcbd85-76bb-4aff-afc6-51b6abe90115(1).png"
    },
    {
      "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115(2).png",
      "originalPath": "Lovart\\35dcbd85-76bb-4aff-afc6-51b6abe90115(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14522,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/35dcbd85-76bb-4aff-afc6-51b6abe90115(2).png"
    },
    {
      "fileName": "35dcbd85-76bb-4aff-afc6-51b6abe90115.png",
      "originalPath": "Lovart\\35dcbd85-76bb-4aff-afc6-51b6abe90115.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1060,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/35dcbd85-76bb-4aff-afc6-51b6abe90115.png"
    },
    {
      "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d(1).png",
      "originalPath": "Lovart\\35dedb17-1269-41df-a082-1c46af8ebd0d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 422770,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/35dedb17-1269-41df-a082-1c46af8ebd0d(1).png"
    },
    {
      "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d(2).png",
      "originalPath": "Lovart\\35dedb17-1269-41df-a082-1c46af8ebd0d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6838,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/35dedb17-1269-41df-a082-1c46af8ebd0d(2).png"
    },
    {
      "fileName": "35dedb17-1269-41df-a082-1c46af8ebd0d.png",
      "originalPath": "Lovart\\35dedb17-1269-41df-a082-1c46af8ebd0d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 798,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/35dedb17-1269-41df-a082-1c46af8ebd0d.png"
    },
    {
      "fileName": "3b85c55c-c6ab-4c39-97c7-7b154ea64f5a(1).png",
      "originalPath": "Lovart\\3b85c55c-c6ab-4c39-97c7-7b154ea64f5a(1).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7966,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3b85c55c-c6ab-4c39-97c7-7b154ea64f5a(1).png"
    },
    {
      "fileName": "3b85c55c-c6ab-4c39-97c7-7b154ea64f5a.png",
      "originalPath": "Lovart\\3b85c55c-c6ab-4c39-97c7-7b154ea64f5a.png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 1075094,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/3b85c55c-c6ab-4c39-97c7-7b154ea64f5a.png"
    },
    {
      "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949(1).png",
      "originalPath": "Lovart\\3b87dd00-b354-441e-b4c1-b9686bd82949(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 525699,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/3b87dd00-b354-441e-b4c1-b9686bd82949(1).png"
    },
    {
      "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949(2).png",
      "originalPath": "Lovart\\3b87dd00-b354-441e-b4c1-b9686bd82949(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8824,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3b87dd00-b354-441e-b4c1-b9686bd82949(2).png"
    },
    {
      "fileName": "3b87dd00-b354-441e-b4c1-b9686bd82949.png",
      "originalPath": "Lovart\\3b87dd00-b354-441e-b4c1-b9686bd82949.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 994,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3b87dd00-b354-441e-b4c1-b9686bd82949.png"
    },
    {
      "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1(1).png",
      "originalPath": "Lovart\\3c9038b9-a062-4fed-85f2-bbd67093c4f1(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 896327,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/3c9038b9-a062-4fed-85f2-bbd67093c4f1(1).png"
    },
    {
      "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1(2).png",
      "originalPath": "Lovart\\3c9038b9-a062-4fed-85f2-bbd67093c4f1(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 17674,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3c9038b9-a062-4fed-85f2-bbd67093c4f1(2).png"
    },
    {
      "fileName": "3c9038b9-a062-4fed-85f2-bbd67093c4f1.png",
      "originalPath": "Lovart\\3c9038b9-a062-4fed-85f2-bbd67093c4f1.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1414,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3c9038b9-a062-4fed-85f2-bbd67093c4f1.png"
    },
    {
      "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b(1).png",
      "originalPath": "Lovart\\3eb25b31-457e-47dc-a691-20e399ea580b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 718710,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/3eb25b31-457e-47dc-a691-20e399ea580b(1).png"
    },
    {
      "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b(2).png",
      "originalPath": "Lovart\\3eb25b31-457e-47dc-a691-20e399ea580b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15448,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3eb25b31-457e-47dc-a691-20e399ea580b(2).png"
    },
    {
      "fileName": "3eb25b31-457e-47dc-a691-20e399ea580b.png",
      "originalPath": "Lovart\\3eb25b31-457e-47dc-a691-20e399ea580b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1404,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3eb25b31-457e-47dc-a691-20e399ea580b.png"
    },
    {
      "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712(1).png",
      "originalPath": "Lovart\\3eb78c3e-0ef0-4f37-84ff-88794d785712(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 622894,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/3eb78c3e-0ef0-4f37-84ff-88794d785712(1).png"
    },
    {
      "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712(2).png",
      "originalPath": "Lovart\\3eb78c3e-0ef0-4f37-84ff-88794d785712(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13292,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3eb78c3e-0ef0-4f37-84ff-88794d785712(2).png"
    },
    {
      "fileName": "3eb78c3e-0ef0-4f37-84ff-88794d785712.png",
      "originalPath": "Lovart\\3eb78c3e-0ef0-4f37-84ff-88794d785712.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1106,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/3eb78c3e-0ef0-4f37-84ff-88794d785712.png"
    },
    {
      "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08(1).png",
      "originalPath": "Lovart\\48370fc1-447a-4dec-9556-1c48b3932c08(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 609625,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/48370fc1-447a-4dec-9556-1c48b3932c08(1).png"
    },
    {
      "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08(2).png",
      "originalPath": "Lovart\\48370fc1-447a-4dec-9556-1c48b3932c08(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8268,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/48370fc1-447a-4dec-9556-1c48b3932c08(2).png"
    },
    {
      "fileName": "48370fc1-447a-4dec-9556-1c48b3932c08.png",
      "originalPath": "Lovart\\48370fc1-447a-4dec-9556-1c48b3932c08.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 788,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/48370fc1-447a-4dec-9556-1c48b3932c08.png"
    },
    {
      "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e(1).png",
      "originalPath": "Lovart\\48ac19a3-229a-4900-badc-fec4b220da2e(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 674934,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/48ac19a3-229a-4900-badc-fec4b220da2e(1).png"
    },
    {
      "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e(2).png",
      "originalPath": "Lovart\\48ac19a3-229a-4900-badc-fec4b220da2e(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13618,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/48ac19a3-229a-4900-badc-fec4b220da2e(2).png"
    },
    {
      "fileName": "48ac19a3-229a-4900-badc-fec4b220da2e.png",
      "originalPath": "Lovart\\48ac19a3-229a-4900-badc-fec4b220da2e.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1410,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/48ac19a3-229a-4900-badc-fec4b220da2e.png"
    },
    {
      "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8(1).png",
      "originalPath": "Lovart\\4ae5a8af-60df-4e63-afed-fbbb0990cca8(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 610291,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/4ae5a8af-60df-4e63-afed-fbbb0990cca8(1).png"
    },
    {
      "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8(2).png",
      "originalPath": "Lovart\\4ae5a8af-60df-4e63-afed-fbbb0990cca8(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10788,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4ae5a8af-60df-4e63-afed-fbbb0990cca8(2).png"
    },
    {
      "fileName": "4ae5a8af-60df-4e63-afed-fbbb0990cca8.png",
      "originalPath": "Lovart\\4ae5a8af-60df-4e63-afed-fbbb0990cca8.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1188,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4ae5a8af-60df-4e63-afed-fbbb0990cca8.png"
    },
    {
      "fileName": "4b985711-8703-4729-93a1-06d9186e42b6(1).png",
      "originalPath": "Lovart\\4b985711-8703-4729-93a1-06d9186e42b6(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 549670,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/4b985711-8703-4729-93a1-06d9186e42b6(1).png"
    },
    {
      "fileName": "4b985711-8703-4729-93a1-06d9186e42b6(2).png",
      "originalPath": "Lovart\\4b985711-8703-4729-93a1-06d9186e42b6(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9016,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4b985711-8703-4729-93a1-06d9186e42b6(2).png"
    },
    {
      "fileName": "4b985711-8703-4729-93a1-06d9186e42b6.png",
      "originalPath": "Lovart\\4b985711-8703-4729-93a1-06d9186e42b6.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 652,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4b985711-8703-4729-93a1-06d9186e42b6.png"
    },
    {
      "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3(1).png",
      "originalPath": "Lovart\\4bad2fde-5258-41c8-bc08-b535bac8c4e3(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 596024,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/4bad2fde-5258-41c8-bc08-b535bac8c4e3(1).png"
    },
    {
      "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3(2).png",
      "originalPath": "Lovart\\4bad2fde-5258-41c8-bc08-b535bac8c4e3(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5844,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4bad2fde-5258-41c8-bc08-b535bac8c4e3(2).png"
    },
    {
      "fileName": "4bad2fde-5258-41c8-bc08-b535bac8c4e3.png",
      "originalPath": "Lovart\\4bad2fde-5258-41c8-bc08-b535bac8c4e3.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 566,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4bad2fde-5258-41c8-bc08-b535bac8c4e3.png"
    },
    {
      "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(1).png",
      "originalPath": "Lovart\\4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 686869,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(1).png"
    },
    {
      "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(2).png",
      "originalPath": "Lovart\\4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11106,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4ec73d19-7e5a-4be5-a51d-ca9e097e8e93(2).png"
    },
    {
      "fileName": "4ec73d19-7e5a-4be5-a51d-ca9e097e8e93.png",
      "originalPath": "Lovart\\4ec73d19-7e5a-4be5-a51d-ca9e097e8e93.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 740,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4ec73d19-7e5a-4be5-a51d-ca9e097e8e93.png"
    },
    {
      "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7(1).png",
      "originalPath": "Lovart\\4f0053c1-d63a-43e9-ba05-dfd2546682a7(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 464496,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/4f0053c1-d63a-43e9-ba05-dfd2546682a7(1).png"
    },
    {
      "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7(2).png",
      "originalPath": "Lovart\\4f0053c1-d63a-43e9-ba05-dfd2546682a7(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6646,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4f0053c1-d63a-43e9-ba05-dfd2546682a7(2).png"
    },
    {
      "fileName": "4f0053c1-d63a-43e9-ba05-dfd2546682a7.png",
      "originalPath": "Lovart\\4f0053c1-d63a-43e9-ba05-dfd2546682a7.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 542,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/4f0053c1-d63a-43e9-ba05-dfd2546682a7.png"
    },
    {
      "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2(1).png",
      "originalPath": "Lovart\\50908b62-4791-4501-a78c-8b480bb7f3b2(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 604240,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/50908b62-4791-4501-a78c-8b480bb7f3b2(1).png"
    },
    {
      "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2(2).png",
      "originalPath": "Lovart\\50908b62-4791-4501-a78c-8b480bb7f3b2(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7480,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/50908b62-4791-4501-a78c-8b480bb7f3b2(2).png"
    },
    {
      "fileName": "50908b62-4791-4501-a78c-8b480bb7f3b2.png",
      "originalPath": "Lovart\\50908b62-4791-4501-a78c-8b480bb7f3b2.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 772,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/50908b62-4791-4501-a78c-8b480bb7f3b2.png"
    },
    {
      "fileName": "5122054d-82ae-4eca-948a-7c856a70e435(1).png",
      "originalPath": "Lovart\\5122054d-82ae-4eca-948a-7c856a70e435(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 707220,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/5122054d-82ae-4eca-948a-7c856a70e435(1).png"
    },
    {
      "fileName": "5122054d-82ae-4eca-948a-7c856a70e435(2).png",
      "originalPath": "Lovart\\5122054d-82ae-4eca-948a-7c856a70e435(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10262,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5122054d-82ae-4eca-948a-7c856a70e435(2).png"
    },
    {
      "fileName": "5122054d-82ae-4eca-948a-7c856a70e435.png",
      "originalPath": "Lovart\\5122054d-82ae-4eca-948a-7c856a70e435.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1088,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5122054d-82ae-4eca-948a-7c856a70e435.png"
    },
    {
      "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6(1).png",
      "originalPath": "Lovart\\514652c1-f90c-415f-84d9-7180dab6b2d6(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 787946,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/514652c1-f90c-415f-84d9-7180dab6b2d6(1).png"
    },
    {
      "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6(2).png",
      "originalPath": "Lovart\\514652c1-f90c-415f-84d9-7180dab6b2d6(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14322,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/514652c1-f90c-415f-84d9-7180dab6b2d6(2).png"
    },
    {
      "fileName": "514652c1-f90c-415f-84d9-7180dab6b2d6.png",
      "originalPath": "Lovart\\514652c1-f90c-415f-84d9-7180dab6b2d6.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1580,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/514652c1-f90c-415f-84d9-7180dab6b2d6.png"
    },
    {
      "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70(1).png",
      "originalPath": "Lovart\\530c54d0-fe9b-4140-875b-7c9650e1be70(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 957441,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/530c54d0-fe9b-4140-875b-7c9650e1be70(1).png"
    },
    {
      "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70(2).png",
      "originalPath": "Lovart\\530c54d0-fe9b-4140-875b-7c9650e1be70(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14242,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/530c54d0-fe9b-4140-875b-7c9650e1be70(2).png"
    },
    {
      "fileName": "530c54d0-fe9b-4140-875b-7c9650e1be70.png",
      "originalPath": "Lovart\\530c54d0-fe9b-4140-875b-7c9650e1be70.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1566,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/530c54d0-fe9b-4140-875b-7c9650e1be70.png"
    },
    {
      "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963(1).png",
      "originalPath": "Lovart\\571d497c-d3b3-4bee-b0cd-b207dd7ea963(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 568801,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/571d497c-d3b3-4bee-b0cd-b207dd7ea963(1).png"
    },
    {
      "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963(2).png",
      "originalPath": "Lovart\\571d497c-d3b3-4bee-b0cd-b207dd7ea963(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5730,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/571d497c-d3b3-4bee-b0cd-b207dd7ea963(2).png"
    },
    {
      "fileName": "571d497c-d3b3-4bee-b0cd-b207dd7ea963.png",
      "originalPath": "Lovart\\571d497c-d3b3-4bee-b0cd-b207dd7ea963.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 586,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/571d497c-d3b3-4bee-b0cd-b207dd7ea963.png"
    },
    {
      "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9(1).png",
      "originalPath": "Lovart\\58ca7bdb-4775-4e4f-b312-4c43a9103bd9(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 915955,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/58ca7bdb-4775-4e4f-b312-4c43a9103bd9(1).png"
    },
    {
      "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9(2).png",
      "originalPath": "Lovart\\58ca7bdb-4775-4e4f-b312-4c43a9103bd9(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13598,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/58ca7bdb-4775-4e4f-b312-4c43a9103bd9(2).png"
    },
    {
      "fileName": "58ca7bdb-4775-4e4f-b312-4c43a9103bd9.png",
      "originalPath": "Lovart\\58ca7bdb-4775-4e4f-b312-4c43a9103bd9.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1304,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/58ca7bdb-4775-4e4f-b312-4c43a9103bd9.png"
    },
    {
      "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82(1).png",
      "originalPath": "Lovart\\5909ee5f-bd78-4b3e-b953-e83c28855d82(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 713497,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/5909ee5f-bd78-4b3e-b953-e83c28855d82(1).png"
    },
    {
      "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82(2).png",
      "originalPath": "Lovart\\5909ee5f-bd78-4b3e-b953-e83c28855d82(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12694,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5909ee5f-bd78-4b3e-b953-e83c28855d82(2).png"
    },
    {
      "fileName": "5909ee5f-bd78-4b3e-b953-e83c28855d82.png",
      "originalPath": "Lovart\\5909ee5f-bd78-4b3e-b953-e83c28855d82.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1394,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5909ee5f-bd78-4b3e-b953-e83c28855d82.png"
    },
    {
      "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac(1).png",
      "originalPath": "Lovart\\59e7631d-f6d7-4172-a524-4738237f03ac(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 898330,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/59e7631d-f6d7-4172-a524-4738237f03ac(1).png"
    },
    {
      "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac(2).png",
      "originalPath": "Lovart\\59e7631d-f6d7-4172-a524-4738237f03ac(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13924,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/59e7631d-f6d7-4172-a524-4738237f03ac(2).png"
    },
    {
      "fileName": "59e7631d-f6d7-4172-a524-4738237f03ac.png",
      "originalPath": "Lovart\\59e7631d-f6d7-4172-a524-4738237f03ac.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1188,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/59e7631d-f6d7-4172-a524-4738237f03ac.png"
    },
    {
      "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794(1).png",
      "originalPath": "Lovart\\59e777b8-bac2-4759-b6d8-9facb3201794(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 534106,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/59e777b8-bac2-4759-b6d8-9facb3201794(1).png"
    },
    {
      "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794(2).png",
      "originalPath": "Lovart\\59e777b8-bac2-4759-b6d8-9facb3201794(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10116,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/59e777b8-bac2-4759-b6d8-9facb3201794(2).png"
    },
    {
      "fileName": "59e777b8-bac2-4759-b6d8-9facb3201794.png",
      "originalPath": "Lovart\\59e777b8-bac2-4759-b6d8-9facb3201794.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 786,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/59e777b8-bac2-4759-b6d8-9facb3201794.png"
    },
    {
      "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b(1).png",
      "originalPath": "Lovart\\5d028e00-b19d-403a-a2b3-77a12e91b25b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 617398,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/5d028e00-b19d-403a-a2b3-77a12e91b25b(1).png"
    },
    {
      "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b(2).png",
      "originalPath": "Lovart\\5d028e00-b19d-403a-a2b3-77a12e91b25b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8518,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5d028e00-b19d-403a-a2b3-77a12e91b25b(2).png"
    },
    {
      "fileName": "5d028e00-b19d-403a-a2b3-77a12e91b25b.png",
      "originalPath": "Lovart\\5d028e00-b19d-403a-a2b3-77a12e91b25b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 806,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5d028e00-b19d-403a-a2b3-77a12e91b25b.png"
    },
    {
      "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4(1).png",
      "originalPath": "Lovart\\5d115a96-e349-4ce9-859a-35b4151c94a4(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 789020,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/5d115a96-e349-4ce9-859a-35b4151c94a4(1).png"
    },
    {
      "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4(2).png",
      "originalPath": "Lovart\\5d115a96-e349-4ce9-859a-35b4151c94a4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14848,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5d115a96-e349-4ce9-859a-35b4151c94a4(2).png"
    },
    {
      "fileName": "5d115a96-e349-4ce9-859a-35b4151c94a4.png",
      "originalPath": "Lovart\\5d115a96-e349-4ce9-859a-35b4151c94a4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1286,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/5d115a96-e349-4ce9-859a-35b4151c94a4.png"
    },
    {
      "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a(1).png",
      "originalPath": "Lovart\\62848ea0-b51d-45af-8415-5ce24e10f36a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 725524,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/62848ea0-b51d-45af-8415-5ce24e10f36a(1).png"
    },
    {
      "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a(2).png",
      "originalPath": "Lovart\\62848ea0-b51d-45af-8415-5ce24e10f36a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13856,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/62848ea0-b51d-45af-8415-5ce24e10f36a(2).png"
    },
    {
      "fileName": "62848ea0-b51d-45af-8415-5ce24e10f36a.png",
      "originalPath": "Lovart\\62848ea0-b51d-45af-8415-5ce24e10f36a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1524,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/62848ea0-b51d-45af-8415-5ce24e10f36a.png"
    },
    {
      "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7(1).png",
      "originalPath": "Lovart\\65b47960-76e7-42e9-a604-4e9d9ba53ef7(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 696249,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/65b47960-76e7-42e9-a604-4e9d9ba53ef7(1).png"
    },
    {
      "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7(2).png",
      "originalPath": "Lovart\\65b47960-76e7-42e9-a604-4e9d9ba53ef7(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12722,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/65b47960-76e7-42e9-a604-4e9d9ba53ef7(2).png"
    },
    {
      "fileName": "65b47960-76e7-42e9-a604-4e9d9ba53ef7.png",
      "originalPath": "Lovart\\65b47960-76e7-42e9-a604-4e9d9ba53ef7.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1236,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/65b47960-76e7-42e9-a604-4e9d9ba53ef7.png"
    },
    {
      "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd(1).png",
      "originalPath": "Lovart\\678af2be-b04f-4c2a-b291-2982c76725cd(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 676221,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/678af2be-b04f-4c2a-b291-2982c76725cd(1).png"
    },
    {
      "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd(2).png",
      "originalPath": "Lovart\\678af2be-b04f-4c2a-b291-2982c76725cd(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 16058,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/678af2be-b04f-4c2a-b291-2982c76725cd(2).png"
    },
    {
      "fileName": "678af2be-b04f-4c2a-b291-2982c76725cd.png",
      "originalPath": "Lovart\\678af2be-b04f-4c2a-b291-2982c76725cd.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1458,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/678af2be-b04f-4c2a-b291-2982c76725cd.png"
    },
    {
      "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68(1).png",
      "originalPath": "Lovart\\6a9b4deb-ac42-4042-b43b-0dd18e9bed68(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 725019,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/6a9b4deb-ac42-4042-b43b-0dd18e9bed68(1).png"
    },
    {
      "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68(2).png",
      "originalPath": "Lovart\\6a9b4deb-ac42-4042-b43b-0dd18e9bed68(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13436,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/6a9b4deb-ac42-4042-b43b-0dd18e9bed68(2).png"
    },
    {
      "fileName": "6a9b4deb-ac42-4042-b43b-0dd18e9bed68.png",
      "originalPath": "Lovart\\6a9b4deb-ac42-4042-b43b-0dd18e9bed68.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1290,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/6a9b4deb-ac42-4042-b43b-0dd18e9bed68.png"
    },
    {
      "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9(1).png",
      "originalPath": "Lovart\\6d204f55-eb20-4dc8-aa7b-0adab5c388c9(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 687771,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/6d204f55-eb20-4dc8-aa7b-0adab5c388c9(1).png"
    },
    {
      "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9(2).png",
      "originalPath": "Lovart\\6d204f55-eb20-4dc8-aa7b-0adab5c388c9(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12992,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/6d204f55-eb20-4dc8-aa7b-0adab5c388c9(2).png"
    },
    {
      "fileName": "6d204f55-eb20-4dc8-aa7b-0adab5c388c9.png",
      "originalPath": "Lovart\\6d204f55-eb20-4dc8-aa7b-0adab5c388c9.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1282,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/6d204f55-eb20-4dc8-aa7b-0adab5c388c9.png"
    },
    {
      "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(1).png",
      "originalPath": "Lovart\\6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 705777,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(1).png"
    },
    {
      "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(2).png",
      "originalPath": "Lovart\\6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8714,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1(2).png"
    },
    {
      "fileName": "6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1.png",
      "originalPath": "Lovart\\6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1112,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/6d7b3af4-ec78-454b-bc9e-c5e4c66f50b1.png"
    },
    {
      "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6(1).png",
      "originalPath": "Lovart\\70fe2cda-1280-4e56-81d9-beb31419d6a6(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 631956,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/70fe2cda-1280-4e56-81d9-beb31419d6a6(1).png"
    },
    {
      "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6(2).png",
      "originalPath": "Lovart\\70fe2cda-1280-4e56-81d9-beb31419d6a6(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12476,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/70fe2cda-1280-4e56-81d9-beb31419d6a6(2).png"
    },
    {
      "fileName": "70fe2cda-1280-4e56-81d9-beb31419d6a6.png",
      "originalPath": "Lovart\\70fe2cda-1280-4e56-81d9-beb31419d6a6.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1478,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/70fe2cda-1280-4e56-81d9-beb31419d6a6.png"
    },
    {
      "fileName": "7288ca44-2d97-448e-af22-a5a07734562f(1).png",
      "originalPath": "Lovart\\7288ca44-2d97-448e-af22-a5a07734562f(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 494691,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/7288ca44-2d97-448e-af22-a5a07734562f(1).png"
    },
    {
      "fileName": "7288ca44-2d97-448e-af22-a5a07734562f(2).png",
      "originalPath": "Lovart\\7288ca44-2d97-448e-af22-a5a07734562f(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8622,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7288ca44-2d97-448e-af22-a5a07734562f(2).png"
    },
    {
      "fileName": "7288ca44-2d97-448e-af22-a5a07734562f.png",
      "originalPath": "Lovart\\7288ca44-2d97-448e-af22-a5a07734562f.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 946,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7288ca44-2d97-448e-af22-a5a07734562f.png"
    },
    {
      "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39(1).png",
      "originalPath": "Lovart\\72f3576e-caec-4176-b9d9-d4c13a994a39(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 723432,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/72f3576e-caec-4176-b9d9-d4c13a994a39(1).png"
    },
    {
      "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39(2).png",
      "originalPath": "Lovart\\72f3576e-caec-4176-b9d9-d4c13a994a39(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13370,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/72f3576e-caec-4176-b9d9-d4c13a994a39(2).png"
    },
    {
      "fileName": "72f3576e-caec-4176-b9d9-d4c13a994a39.png",
      "originalPath": "Lovart\\72f3576e-caec-4176-b9d9-d4c13a994a39.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1310,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/72f3576e-caec-4176-b9d9-d4c13a994a39.png"
    },
    {
      "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b(1).png",
      "originalPath": "Lovart\\736be647-67f4-4816-b3a8-2a0de68c709b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 592511,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/736be647-67f4-4816-b3a8-2a0de68c709b(1).png"
    },
    {
      "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b(2).png",
      "originalPath": "Lovart\\736be647-67f4-4816-b3a8-2a0de68c709b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7306,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/736be647-67f4-4816-b3a8-2a0de68c709b(2).png"
    },
    {
      "fileName": "736be647-67f4-4816-b3a8-2a0de68c709b.png",
      "originalPath": "Lovart\\736be647-67f4-4816-b3a8-2a0de68c709b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1036,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/736be647-67f4-4816-b3a8-2a0de68c709b.png"
    },
    {
      "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede(1).png",
      "originalPath": "Lovart\\742a7ecb-e413-4030-ac61-21d78c915ede(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 837956,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/742a7ecb-e413-4030-ac61-21d78c915ede(1).png"
    },
    {
      "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede(2).png",
      "originalPath": "Lovart\\742a7ecb-e413-4030-ac61-21d78c915ede(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8784,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/742a7ecb-e413-4030-ac61-21d78c915ede(2).png"
    },
    {
      "fileName": "742a7ecb-e413-4030-ac61-21d78c915ede.png",
      "originalPath": "Lovart\\742a7ecb-e413-4030-ac61-21d78c915ede.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 980,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/742a7ecb-e413-4030-ac61-21d78c915ede.png"
    },
    {
      "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d(1).png",
      "originalPath": "Lovart\\76dec646-f990-4051-8f4e-96874f59ca9d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 632078,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/76dec646-f990-4051-8f4e-96874f59ca9d(1).png"
    },
    {
      "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d(2).png",
      "originalPath": "Lovart\\76dec646-f990-4051-8f4e-96874f59ca9d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9252,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/76dec646-f990-4051-8f4e-96874f59ca9d(2).png"
    },
    {
      "fileName": "76dec646-f990-4051-8f4e-96874f59ca9d.png",
      "originalPath": "Lovart\\76dec646-f990-4051-8f4e-96874f59ca9d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 938,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/76dec646-f990-4051-8f4e-96874f59ca9d.png"
    },
    {
      "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029(1).png",
      "originalPath": "Lovart\\78824c5d-0eab-4f76-a369-1e1d94d3f029(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 632959,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/78824c5d-0eab-4f76-a369-1e1d94d3f029(1).png"
    },
    {
      "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029(2).png",
      "originalPath": "Lovart\\78824c5d-0eab-4f76-a369-1e1d94d3f029(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11666,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/78824c5d-0eab-4f76-a369-1e1d94d3f029(2).png"
    },
    {
      "fileName": "78824c5d-0eab-4f76-a369-1e1d94d3f029.png",
      "originalPath": "Lovart\\78824c5d-0eab-4f76-a369-1e1d94d3f029.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1220,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/78824c5d-0eab-4f76-a369-1e1d94d3f029.png"
    },
    {
      "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(1).png",
      "originalPath": "Lovart\\7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 808359,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(1).png"
    },
    {
      "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(2).png",
      "originalPath": "Lovart\\7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15134,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7a4f38e1-f68a-4aa2-b174-28d82b9ac38d(2).png"
    },
    {
      "fileName": "7a4f38e1-f68a-4aa2-b174-28d82b9ac38d.png",
      "originalPath": "Lovart\\7a4f38e1-f68a-4aa2-b174-28d82b9ac38d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1514,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7a4f38e1-f68a-4aa2-b174-28d82b9ac38d.png"
    },
    {
      "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(1).png",
      "originalPath": "Lovart\\7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 913011,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(1).png"
    },
    {
      "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(2).png",
      "originalPath": "Lovart\\7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14076,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7a9fa38b-1e7b-4838-84a4-c02034e0cb3a(2).png"
    },
    {
      "fileName": "7a9fa38b-1e7b-4838-84a4-c02034e0cb3a.png",
      "originalPath": "Lovart\\7a9fa38b-1e7b-4838-84a4-c02034e0cb3a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1206,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7a9fa38b-1e7b-4838-84a4-c02034e0cb3a.png"
    },
    {
      "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(1).png",
      "originalPath": "Lovart\\7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 689865,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(1).png"
    },
    {
      "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(2).png",
      "originalPath": "Lovart\\7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14084,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7b1f3415-f17d-43fc-ba4e-7a5014da1cd1(2).png"
    },
    {
      "fileName": "7b1f3415-f17d-43fc-ba4e-7a5014da1cd1.png",
      "originalPath": "Lovart\\7b1f3415-f17d-43fc-ba4e-7a5014da1cd1.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1490,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7b1f3415-f17d-43fc-ba4e-7a5014da1cd1.png"
    },
    {
      "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(1).png",
      "originalPath": "Lovart\\7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 674480,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(1).png"
    },
    {
      "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(2).png",
      "originalPath": "Lovart\\7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12016,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7eed67fe-3ba7-4ddc-bb70-aa1135ff8335(2).png"
    },
    {
      "fileName": "7eed67fe-3ba7-4ddc-bb70-aa1135ff8335.png",
      "originalPath": "Lovart\\7eed67fe-3ba7-4ddc-bb70-aa1135ff8335.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1390,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/7eed67fe-3ba7-4ddc-bb70-aa1135ff8335.png"
    },
    {
      "fileName": "809723b7-130e-478c-9b54-fe40739a1eee(1).png",
      "originalPath": "Lovart\\809723b7-130e-478c-9b54-fe40739a1eee(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 537732,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/809723b7-130e-478c-9b54-fe40739a1eee(1).png"
    },
    {
      "fileName": "809723b7-130e-478c-9b54-fe40739a1eee(2).png",
      "originalPath": "Lovart\\809723b7-130e-478c-9b54-fe40739a1eee(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8812,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/809723b7-130e-478c-9b54-fe40739a1eee(2).png"
    },
    {
      "fileName": "809723b7-130e-478c-9b54-fe40739a1eee.png",
      "originalPath": "Lovart\\809723b7-130e-478c-9b54-fe40739a1eee.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 672,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/809723b7-130e-478c-9b54-fe40739a1eee.png"
    },
    {
      "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124(1).png",
      "originalPath": "Lovart\\839a4f2c-7f90-41e6-9def-f7f132d2a124(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 331804,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/839a4f2c-7f90-41e6-9def-f7f132d2a124(1).png"
    },
    {
      "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124(2).png",
      "originalPath": "Lovart\\839a4f2c-7f90-41e6-9def-f7f132d2a124(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5268,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/839a4f2c-7f90-41e6-9def-f7f132d2a124(2).png"
    },
    {
      "fileName": "839a4f2c-7f90-41e6-9def-f7f132d2a124.png",
      "originalPath": "Lovart\\839a4f2c-7f90-41e6-9def-f7f132d2a124.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 336,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/839a4f2c-7f90-41e6-9def-f7f132d2a124.png"
    },
    {
      "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b(1).png",
      "originalPath": "Lovart\\858077f7-5c82-4211-a5cf-582f43f8a75b(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 804575,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/858077f7-5c82-4211-a5cf-582f43f8a75b(1).png"
    },
    {
      "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b(2).png",
      "originalPath": "Lovart\\858077f7-5c82-4211-a5cf-582f43f8a75b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14734,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/858077f7-5c82-4211-a5cf-582f43f8a75b(2).png"
    },
    {
      "fileName": "858077f7-5c82-4211-a5cf-582f43f8a75b.png",
      "originalPath": "Lovart\\858077f7-5c82-4211-a5cf-582f43f8a75b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1280,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/858077f7-5c82-4211-a5cf-582f43f8a75b.png"
    },
    {
      "fileName": "86e394a7-f886-4abd-9b19-72301c36a392(1).png",
      "originalPath": "Lovart\\86e394a7-f886-4abd-9b19-72301c36a392(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 411230,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/86e394a7-f886-4abd-9b19-72301c36a392(1).png"
    },
    {
      "fileName": "86e394a7-f886-4abd-9b19-72301c36a392(2).png",
      "originalPath": "Lovart\\86e394a7-f886-4abd-9b19-72301c36a392(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7100,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/86e394a7-f886-4abd-9b19-72301c36a392(2).png"
    },
    {
      "fileName": "86e394a7-f886-4abd-9b19-72301c36a392.png",
      "originalPath": "Lovart\\86e394a7-f886-4abd-9b19-72301c36a392.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 644,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/86e394a7-f886-4abd-9b19-72301c36a392.png"
    },
    {
      "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4(1).png",
      "originalPath": "Lovart\\89fb202c-a67d-4871-912a-64c22b0073b4(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 709145,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/89fb202c-a67d-4871-912a-64c22b0073b4(1).png"
    },
    {
      "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4(2).png",
      "originalPath": "Lovart\\89fb202c-a67d-4871-912a-64c22b0073b4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13404,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/89fb202c-a67d-4871-912a-64c22b0073b4(2).png"
    },
    {
      "fileName": "89fb202c-a67d-4871-912a-64c22b0073b4.png",
      "originalPath": "Lovart\\89fb202c-a67d-4871-912a-64c22b0073b4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1098,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/89fb202c-a67d-4871-912a-64c22b0073b4.png"
    },
    {
      "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(1).png",
      "originalPath": "Lovart\\8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 609543,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(1).png"
    },
    {
      "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(2).png",
      "originalPath": "Lovart\\8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11740,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4(2).png"
    },
    {
      "fileName": "8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4.png",
      "originalPath": "Lovart\\8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1156,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8b4a271f-13bc-4ea4-b70a-a0b1b433a9a4.png"
    },
    {
      "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f(1).png",
      "originalPath": "Lovart\\8d1d8686-29d3-4c37-8822-086c5e76328f(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 636886,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/8d1d8686-29d3-4c37-8822-086c5e76328f(1).png"
    },
    {
      "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f(2).png",
      "originalPath": "Lovart\\8d1d8686-29d3-4c37-8822-086c5e76328f(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7520,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8d1d8686-29d3-4c37-8822-086c5e76328f(2).png"
    },
    {
      "fileName": "8d1d8686-29d3-4c37-8822-086c5e76328f.png",
      "originalPath": "Lovart\\8d1d8686-29d3-4c37-8822-086c5e76328f.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1128,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8d1d8686-29d3-4c37-8822-086c5e76328f.png"
    },
    {
      "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e(1).png",
      "originalPath": "Lovart\\8d9807e9-b61b-49df-a2d8-cb0b3762958e(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 522992,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/8d9807e9-b61b-49df-a2d8-cb0b3762958e(1).png"
    },
    {
      "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e(2).png",
      "originalPath": "Lovart\\8d9807e9-b61b-49df-a2d8-cb0b3762958e(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7980,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8d9807e9-b61b-49df-a2d8-cb0b3762958e(2).png"
    },
    {
      "fileName": "8d9807e9-b61b-49df-a2d8-cb0b3762958e.png",
      "originalPath": "Lovart\\8d9807e9-b61b-49df-a2d8-cb0b3762958e.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 806,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8d9807e9-b61b-49df-a2d8-cb0b3762958e.png"
    },
    {
      "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c(1).png",
      "originalPath": "Lovart\\8dd3a592-a5d0-44db-8002-6d110eac968c(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 632879,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/8dd3a592-a5d0-44db-8002-6d110eac968c(1).png"
    },
    {
      "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c(2).png",
      "originalPath": "Lovart\\8dd3a592-a5d0-44db-8002-6d110eac968c(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11992,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8dd3a592-a5d0-44db-8002-6d110eac968c(2).png"
    },
    {
      "fileName": "8dd3a592-a5d0-44db-8002-6d110eac968c.png",
      "originalPath": "Lovart\\8dd3a592-a5d0-44db-8002-6d110eac968c.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1420,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8dd3a592-a5d0-44db-8002-6d110eac968c.png"
    },
    {
      "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d(1).png",
      "originalPath": "Lovart\\8de9f284-862d-490e-9e8a-760f4c142b3d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 658717,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/8de9f284-862d-490e-9e8a-760f4c142b3d(1).png"
    },
    {
      "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d(2).png",
      "originalPath": "Lovart\\8de9f284-862d-490e-9e8a-760f4c142b3d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11942,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8de9f284-862d-490e-9e8a-760f4c142b3d(2).png"
    },
    {
      "fileName": "8de9f284-862d-490e-9e8a-760f4c142b3d.png",
      "originalPath": "Lovart\\8de9f284-862d-490e-9e8a-760f4c142b3d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 996,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/8de9f284-862d-490e-9e8a-760f4c142b3d.png"
    },
    {
      "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa(1).png",
      "originalPath": "Lovart\\92ea8771-bb74-4be9-ba3c-62e199dbc1aa(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 678251,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/92ea8771-bb74-4be9-ba3c-62e199dbc1aa(1).png"
    },
    {
      "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa(2).png",
      "originalPath": "Lovart\\92ea8771-bb74-4be9-ba3c-62e199dbc1aa(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14170,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/92ea8771-bb74-4be9-ba3c-62e199dbc1aa(2).png"
    },
    {
      "fileName": "92ea8771-bb74-4be9-ba3c-62e199dbc1aa.png",
      "originalPath": "Lovart\\92ea8771-bb74-4be9-ba3c-62e199dbc1aa.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1140,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/92ea8771-bb74-4be9-ba3c-62e199dbc1aa.png"
    },
    {
      "fileName": "9666dcc96aaac0ce6cf4a11b5a80ddaf0056f46d.png",
      "originalPath": "Lovart\\9666dcc96aaac0ce6cf4a11b5a80ddaf0056f46d.png",
      "category": "icon-sets",
      "subcategory": "action-icons",
      "theme": "modern",
      "size": 99190,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icon-sets/modern/9666dcc96aaac0ce6cf4a11b5a80ddaf0056f46d.png"
    },
    {
      "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff(1).png",
      "originalPath": "Lovart\\9684577b-2dde-4ccd-9cef-13853f26a0ff(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 791977,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9684577b-2dde-4ccd-9cef-13853f26a0ff(1).png"
    },
    {
      "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff(2).png",
      "originalPath": "Lovart\\9684577b-2dde-4ccd-9cef-13853f26a0ff(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12346,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9684577b-2dde-4ccd-9cef-13853f26a0ff(2).png"
    },
    {
      "fileName": "9684577b-2dde-4ccd-9cef-13853f26a0ff.png",
      "originalPath": "Lovart\\9684577b-2dde-4ccd-9cef-13853f26a0ff.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1286,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9684577b-2dde-4ccd-9cef-13853f26a0ff.png"
    },
    {
      "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561(1).png",
      "originalPath": "Lovart\\987eee03-a5bf-4fa9-b266-c0447f62c561(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 800261,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/987eee03-a5bf-4fa9-b266-c0447f62c561(1).png"
    },
    {
      "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561(2).png",
      "originalPath": "Lovart\\987eee03-a5bf-4fa9-b266-c0447f62c561(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13408,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/987eee03-a5bf-4fa9-b266-c0447f62c561(2).png"
    },
    {
      "fileName": "987eee03-a5bf-4fa9-b266-c0447f62c561.png",
      "originalPath": "Lovart\\987eee03-a5bf-4fa9-b266-c0447f62c561.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1388,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/987eee03-a5bf-4fa9-b266-c0447f62c561.png"
    },
    {
      "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3(1).png",
      "originalPath": "Lovart\\9894764b-b1ec-4448-98bd-00397ad0ddc3(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 521892,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9894764b-b1ec-4448-98bd-00397ad0ddc3(1).png"
    },
    {
      "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3(2).png",
      "originalPath": "Lovart\\9894764b-b1ec-4448-98bd-00397ad0ddc3(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8686,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9894764b-b1ec-4448-98bd-00397ad0ddc3(2).png"
    },
    {
      "fileName": "9894764b-b1ec-4448-98bd-00397ad0ddc3.png",
      "originalPath": "Lovart\\9894764b-b1ec-4448-98bd-00397ad0ddc3.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1020,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9894764b-b1ec-4448-98bd-00397ad0ddc3.png"
    },
    {
      "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562(1).png",
      "originalPath": "Lovart\\99265f7e-d6e7-427e-ab31-64a734f3d562(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 1052903,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/99265f7e-d6e7-427e-ab31-64a734f3d562(1).png"
    },
    {
      "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562(2).png",
      "originalPath": "Lovart\\99265f7e-d6e7-427e-ab31-64a734f3d562(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 19130,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/99265f7e-d6e7-427e-ab31-64a734f3d562(2).png"
    },
    {
      "fileName": "99265f7e-d6e7-427e-ab31-64a734f3d562.png",
      "originalPath": "Lovart\\99265f7e-d6e7-427e-ab31-64a734f3d562.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1570,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/99265f7e-d6e7-427e-ab31-64a734f3d562.png"
    },
    {
      "fileName": "9b437738-8336-4c90-ae33-87d43225bae7(1).png",
      "originalPath": "Lovart\\9b437738-8336-4c90-ae33-87d43225bae7(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 639189,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9b437738-8336-4c90-ae33-87d43225bae7(1).png"
    },
    {
      "fileName": "9b437738-8336-4c90-ae33-87d43225bae7(2).png",
      "originalPath": "Lovart\\9b437738-8336-4c90-ae33-87d43225bae7(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9914,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9b437738-8336-4c90-ae33-87d43225bae7(2).png"
    },
    {
      "fileName": "9b437738-8336-4c90-ae33-87d43225bae7.png",
      "originalPath": "Lovart\\9b437738-8336-4c90-ae33-87d43225bae7.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1006,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9b437738-8336-4c90-ae33-87d43225bae7.png"
    },
    {
      "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a(1).png",
      "originalPath": "Lovart\\9b863e97-9e60-4933-a6c2-ed5c4400a84a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 526335,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9b863e97-9e60-4933-a6c2-ed5c4400a84a(1).png"
    },
    {
      "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a(2).png",
      "originalPath": "Lovart\\9b863e97-9e60-4933-a6c2-ed5c4400a84a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6386,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9b863e97-9e60-4933-a6c2-ed5c4400a84a(2).png"
    },
    {
      "fileName": "9b863e97-9e60-4933-a6c2-ed5c4400a84a.png",
      "originalPath": "Lovart\\9b863e97-9e60-4933-a6c2-ed5c4400a84a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 588,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9b863e97-9e60-4933-a6c2-ed5c4400a84a.png"
    },
    {
      "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(1).png",
      "originalPath": "Lovart\\9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 600351,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(1).png"
    },
    {
      "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(2).png",
      "originalPath": "Lovart\\9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8264,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a(2).png"
    },
    {
      "fileName": "9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a.png",
      "originalPath": "Lovart\\9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1058,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9c4595c6-73c8-4e2c-8f4f-3a89cc16cf2a.png"
    },
    {
      "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(1).png",
      "originalPath": "Lovart\\9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(1).png",
      "category": "icon-sets",
      "subcategory": "action-icons",
      "theme": "modern",
      "size": 258741,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icon-sets/modern/9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(1).png"
    },
    {
      "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(2).png",
      "originalPath": "Lovart\\9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 3342,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217(2).png"
    },
    {
      "fileName": "9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217.png",
      "originalPath": "Lovart\\9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 652,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9df65d9a-d1f5-4ac2-93a5-4d7ce1e73217.png"
    },
    {
      "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720(1).png",
      "originalPath": "Lovart\\9e325608-d2df-4a4d-a880-b8011c69a720(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 758417,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9e325608-d2df-4a4d-a880-b8011c69a720(1).png"
    },
    {
      "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720(2).png",
      "originalPath": "Lovart\\9e325608-d2df-4a4d-a880-b8011c69a720(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13708,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9e325608-d2df-4a4d-a880-b8011c69a720(2).png"
    },
    {
      "fileName": "9e325608-d2df-4a4d-a880-b8011c69a720.png",
      "originalPath": "Lovart\\9e325608-d2df-4a4d-a880-b8011c69a720.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1480,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9e325608-d2df-4a4d-a880-b8011c69a720.png"
    },
    {
      "fileName": "9f1c7af1171478b0a972190c9e3f2dbd4583b77a.png",
      "originalPath": "Lovart\\9f1c7af1171478b0a972190c9e3f2dbd4583b77a.png",
      "category": "icon-sets",
      "subcategory": "action-icons",
      "theme": "modern",
      "size": 100323,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icon-sets/modern/9f1c7af1171478b0a972190c9e3f2dbd4583b77a.png"
    },
    {
      "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5(1).png",
      "originalPath": "Lovart\\9fd2499b-dec3-478f-96b1-3385cb2965a5(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 717174,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/9fd2499b-dec3-478f-96b1-3385cb2965a5(1).png"
    },
    {
      "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5(2).png",
      "originalPath": "Lovart\\9fd2499b-dec3-478f-96b1-3385cb2965a5(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12212,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9fd2499b-dec3-478f-96b1-3385cb2965a5(2).png"
    },
    {
      "fileName": "9fd2499b-dec3-478f-96b1-3385cb2965a5.png",
      "originalPath": "Lovart\\9fd2499b-dec3-478f-96b1-3385cb2965a5.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1178,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/9fd2499b-dec3-478f-96b1-3385cb2965a5.png"
    },
    {
      "fileName": "a5f17821-366d-43b5-86e3-a9e712032684(1).png",
      "originalPath": "Lovart\\a5f17821-366d-43b5-86e3-a9e712032684(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 829643,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/a5f17821-366d-43b5-86e3-a9e712032684(1).png"
    },
    {
      "fileName": "a5f17821-366d-43b5-86e3-a9e712032684(2).png",
      "originalPath": "Lovart\\a5f17821-366d-43b5-86e3-a9e712032684(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14926,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/a5f17821-366d-43b5-86e3-a9e712032684(2).png"
    },
    {
      "fileName": "a5f17821-366d-43b5-86e3-a9e712032684.png",
      "originalPath": "Lovart\\a5f17821-366d-43b5-86e3-a9e712032684.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1400,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/a5f17821-366d-43b5-86e3-a9e712032684.png"
    },
    {
      "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e(1).png",
      "originalPath": "Lovart\\a7821c9e-2b8b-45bc-9211-539da8f0a89e(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 505925,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/a7821c9e-2b8b-45bc-9211-539da8f0a89e(1).png"
    },
    {
      "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e(2).png",
      "originalPath": "Lovart\\a7821c9e-2b8b-45bc-9211-539da8f0a89e(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7044,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/a7821c9e-2b8b-45bc-9211-539da8f0a89e(2).png"
    },
    {
      "fileName": "a7821c9e-2b8b-45bc-9211-539da8f0a89e.png",
      "originalPath": "Lovart\\a7821c9e-2b8b-45bc-9211-539da8f0a89e.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 630,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/a7821c9e-2b8b-45bc-9211-539da8f0a89e.png"
    },
    {
      "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(1).png",
      "originalPath": "Lovart\\a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 511078,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(1).png"
    },
    {
      "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(2).png",
      "originalPath": "Lovart\\a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7144,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/a8cf90e1-94e0-4280-ae4d-c5220a5a6a19(2).png"
    },
    {
      "fileName": "a8cf90e1-94e0-4280-ae4d-c5220a5a6a19.png",
      "originalPath": "Lovart\\a8cf90e1-94e0-4280-ae4d-c5220a5a6a19.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 704,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/a8cf90e1-94e0-4280-ae4d-c5220a5a6a19.png"
    },
    {
      "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558(1).png",
      "originalPath": "Lovart\\b1e7183e-d7a8-4f92-bfe6-730a29674558(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 503575,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/b1e7183e-d7a8-4f92-bfe6-730a29674558(1).png"
    },
    {
      "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558(2).png",
      "originalPath": "Lovart\\b1e7183e-d7a8-4f92-bfe6-730a29674558(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6954,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b1e7183e-d7a8-4f92-bfe6-730a29674558(2).png"
    },
    {
      "fileName": "b1e7183e-d7a8-4f92-bfe6-730a29674558.png",
      "originalPath": "Lovart\\b1e7183e-d7a8-4f92-bfe6-730a29674558.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 690,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b1e7183e-d7a8-4f92-bfe6-730a29674558.png"
    },
    {
      "fileName": "b324bc6d-6cf2-4542-aa05-424191416330(1).png",
      "originalPath": "Lovart\\b324bc6d-6cf2-4542-aa05-424191416330(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 738581,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/b324bc6d-6cf2-4542-aa05-424191416330(1).png"
    },
    {
      "fileName": "b324bc6d-6cf2-4542-aa05-424191416330(2).png",
      "originalPath": "Lovart\\b324bc6d-6cf2-4542-aa05-424191416330(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13286,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b324bc6d-6cf2-4542-aa05-424191416330(2).png"
    },
    {
      "fileName": "b324bc6d-6cf2-4542-aa05-424191416330.png",
      "originalPath": "Lovart\\b324bc6d-6cf2-4542-aa05-424191416330.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1320,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b324bc6d-6cf2-4542-aa05-424191416330.png"
    },
    {
      "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f(1).png",
      "originalPath": "Lovart\\b5b74992-564a-4140-8c38-2bbc5d327d3f(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 811308,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/b5b74992-564a-4140-8c38-2bbc5d327d3f(1).png"
    },
    {
      "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f(2).png",
      "originalPath": "Lovart\\b5b74992-564a-4140-8c38-2bbc5d327d3f(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7728,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b5b74992-564a-4140-8c38-2bbc5d327d3f(2).png"
    },
    {
      "fileName": "b5b74992-564a-4140-8c38-2bbc5d327d3f.png",
      "originalPath": "Lovart\\b5b74992-564a-4140-8c38-2bbc5d327d3f.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 868,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b5b74992-564a-4140-8c38-2bbc5d327d3f.png"
    },
    {
      "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(1).png",
      "originalPath": "Lovart\\b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 581873,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(1).png"
    },
    {
      "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(2).png",
      "originalPath": "Lovart\\b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7308,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12(2).png"
    },
    {
      "fileName": "b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12.png",
      "originalPath": "Lovart\\b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 744,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b5fa6fc4-2b76-41c9-bd28-8670ec2dfa12.png"
    },
    {
      "fileName": "b83537c4-4315-4f1e-9970-b0416829e686(1).png",
      "originalPath": "Lovart\\b83537c4-4315-4f1e-9970-b0416829e686(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 480137,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/b83537c4-4315-4f1e-9970-b0416829e686(1).png"
    },
    {
      "fileName": "b83537c4-4315-4f1e-9970-b0416829e686(2).png",
      "originalPath": "Lovart\\b83537c4-4315-4f1e-9970-b0416829e686(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6648,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b83537c4-4315-4f1e-9970-b0416829e686(2).png"
    },
    {
      "fileName": "b83537c4-4315-4f1e-9970-b0416829e686.png",
      "originalPath": "Lovart\\b83537c4-4315-4f1e-9970-b0416829e686.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 974,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b83537c4-4315-4f1e-9970-b0416829e686.png"
    },
    {
      "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8(1).png",
      "originalPath": "Lovart\\b9b9254d-302a-4690-aa8a-1314e66021b8(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 774946,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/b9b9254d-302a-4690-aa8a-1314e66021b8(1).png"
    },
    {
      "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8(2).png",
      "originalPath": "Lovart\\b9b9254d-302a-4690-aa8a-1314e66021b8(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15050,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b9b9254d-302a-4690-aa8a-1314e66021b8(2).png"
    },
    {
      "fileName": "b9b9254d-302a-4690-aa8a-1314e66021b8.png",
      "originalPath": "Lovart\\b9b9254d-302a-4690-aa8a-1314e66021b8.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1480,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/b9b9254d-302a-4690-aa8a-1314e66021b8.png"
    },
    {
      "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(1).png",
      "originalPath": "Lovart\\ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 768349,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(1).png"
    },
    {
      "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(2).png",
      "originalPath": "Lovart\\ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13654,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/ba51f0f0-891a-4708-b9b0-16a9bef9b9ea(2).png"
    },
    {
      "fileName": "ba51f0f0-891a-4708-b9b0-16a9bef9b9ea.png",
      "originalPath": "Lovart\\ba51f0f0-891a-4708-b9b0-16a9bef9b9ea.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1538,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/ba51f0f0-891a-4708-b9b0-16a9bef9b9ea.png"
    },
    {
      "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2(1).png",
      "originalPath": "Lovart\\baf973ed-e5d5-4231-9f2b-a388f755a5b2(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 688975,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/baf973ed-e5d5-4231-9f2b-a388f755a5b2(1).png"
    },
    {
      "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2(2).png",
      "originalPath": "Lovart\\baf973ed-e5d5-4231-9f2b-a388f755a5b2(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12922,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/baf973ed-e5d5-4231-9f2b-a388f755a5b2(2).png"
    },
    {
      "fileName": "baf973ed-e5d5-4231-9f2b-a388f755a5b2.png",
      "originalPath": "Lovart\\baf973ed-e5d5-4231-9f2b-a388f755a5b2.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1372,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/baf973ed-e5d5-4231-9f2b-a388f755a5b2.png"
    },
    {
      "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(1).png",
      "originalPath": "Lovart\\c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 891969,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(1).png"
    },
    {
      "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(2).png",
      "originalPath": "Lovart\\c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13286,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63(2).png"
    },
    {
      "fileName": "c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63.png",
      "originalPath": "Lovart\\c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1356,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c0c764ff-ff2f-45b4-a8c3-78d8bfdcab63.png"
    },
    {
      "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7(1).png",
      "originalPath": "Lovart\\c10a68c9-c09c-42af-b707-5f0341b094b7(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 1128219,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/c10a68c9-c09c-42af-b707-5f0341b094b7(1).png"
    },
    {
      "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7(2).png",
      "originalPath": "Lovart\\c10a68c9-c09c-42af-b707-5f0341b094b7(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 20330,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c10a68c9-c09c-42af-b707-5f0341b094b7(2).png"
    },
    {
      "fileName": "c10a68c9-c09c-42af-b707-5f0341b094b7.png",
      "originalPath": "Lovart\\c10a68c9-c09c-42af-b707-5f0341b094b7.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1598,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c10a68c9-c09c-42af-b707-5f0341b094b7.png"
    },
    {
      "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc(1).png",
      "originalPath": "Lovart\\c1bcffd3-ce57-4b3a-9571-f1a674db54cc(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 704818,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/c1bcffd3-ce57-4b3a-9571-f1a674db54cc(1).png"
    },
    {
      "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc(2).png",
      "originalPath": "Lovart\\c1bcffd3-ce57-4b3a-9571-f1a674db54cc(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9884,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c1bcffd3-ce57-4b3a-9571-f1a674db54cc(2).png"
    },
    {
      "fileName": "c1bcffd3-ce57-4b3a-9571-f1a674db54cc.png",
      "originalPath": "Lovart\\c1bcffd3-ce57-4b3a-9571-f1a674db54cc.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 986,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c1bcffd3-ce57-4b3a-9571-f1a674db54cc.png"
    },
    {
      "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697(1).png",
      "originalPath": "Lovart\\c1f779ee-1f6b-48cb-9754-67d02b7f3697(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 634048,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/c1f779ee-1f6b-48cb-9754-67d02b7f3697(1).png"
    },
    {
      "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697(2).png",
      "originalPath": "Lovart\\c1f779ee-1f6b-48cb-9754-67d02b7f3697(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8620,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c1f779ee-1f6b-48cb-9754-67d02b7f3697(2).png"
    },
    {
      "fileName": "c1f779ee-1f6b-48cb-9754-67d02b7f3697.png",
      "originalPath": "Lovart\\c1f779ee-1f6b-48cb-9754-67d02b7f3697.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 960,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c1f779ee-1f6b-48cb-9754-67d02b7f3697.png"
    },
    {
      "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(1).png",
      "originalPath": "Lovart\\c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 715160,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(1).png"
    },
    {
      "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(2).png",
      "originalPath": "Lovart\\c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11466,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c50ca07d-bc9f-423a-8a2a-64a8b87c5a33(2).png"
    },
    {
      "fileName": "c50ca07d-bc9f-423a-8a2a-64a8b87c5a33.png",
      "originalPath": "Lovart\\c50ca07d-bc9f-423a-8a2a-64a8b87c5a33.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 790,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c50ca07d-bc9f-423a-8a2a-64a8b87c5a33.png"
    },
    {
      "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228(1).png",
      "originalPath": "Lovart\\c9457355-729f-43e4-b7ee-fa7f037c3228(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 1059292,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/c9457355-729f-43e4-b7ee-fa7f037c3228(1).png"
    },
    {
      "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228(2).png",
      "originalPath": "Lovart\\c9457355-729f-43e4-b7ee-fa7f037c3228(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 6676,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c9457355-729f-43e4-b7ee-fa7f037c3228(2).png"
    },
    {
      "fileName": "c9457355-729f-43e4-b7ee-fa7f037c3228.png",
      "originalPath": "Lovart\\c9457355-729f-43e4-b7ee-fa7f037c3228.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 624,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/c9457355-729f-43e4-b7ee-fa7f037c3228.png"
    },
    {
      "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982(1).png",
      "originalPath": "Lovart\\cbe41657-dd95-4bb0-905f-bf324e52e982(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 713433,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/cbe41657-dd95-4bb0-905f-bf324e52e982(1).png"
    },
    {
      "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982(2).png",
      "originalPath": "Lovart\\cbe41657-dd95-4bb0-905f-bf324e52e982(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14116,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/cbe41657-dd95-4bb0-905f-bf324e52e982(2).png"
    },
    {
      "fileName": "cbe41657-dd95-4bb0-905f-bf324e52e982.png",
      "originalPath": "Lovart\\cbe41657-dd95-4bb0-905f-bf324e52e982.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1158,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/cbe41657-dd95-4bb0-905f-bf324e52e982.png"
    },
    {
      "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(1).png",
      "originalPath": "Lovart\\ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 528791,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(1).png"
    },
    {
      "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(2).png",
      "originalPath": "Lovart\\ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8940,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/ce5676e4-9437-43e3-a0f1-f6ff6bfceea4(2).png"
    },
    {
      "fileName": "ce5676e4-9437-43e3-a0f1-f6ff6bfceea4.png",
      "originalPath": "Lovart\\ce5676e4-9437-43e3-a0f1-f6ff6bfceea4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 652,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/ce5676e4-9437-43e3-a0f1-f6ff6bfceea4.png"
    },
    {
      "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(1).png",
      "originalPath": "Lovart\\cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 677423,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(1).png"
    },
    {
      "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(2).png",
      "originalPath": "Lovart\\cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15944,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/cfc863f5-f7d5-4cbe-bb43-2f1d855161f2(2).png"
    },
    {
      "fileName": "cfc863f5-f7d5-4cbe-bb43-2f1d855161f2.png",
      "originalPath": "Lovart\\cfc863f5-f7d5-4cbe-bb43-2f1d855161f2.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1392,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/cfc863f5-f7d5-4cbe-bb43-2f1d855161f2.png"
    },
    {
      "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532(1).png",
      "originalPath": "Lovart\\d16f4947-2fbf-4a8e-841f-ccfae5031532(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 674088,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/d16f4947-2fbf-4a8e-841f-ccfae5031532(1).png"
    },
    {
      "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532(2).png",
      "originalPath": "Lovart\\d16f4947-2fbf-4a8e-841f-ccfae5031532(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12718,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d16f4947-2fbf-4a8e-841f-ccfae5031532(2).png"
    },
    {
      "fileName": "d16f4947-2fbf-4a8e-841f-ccfae5031532.png",
      "originalPath": "Lovart\\d16f4947-2fbf-4a8e-841f-ccfae5031532.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1066,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d16f4947-2fbf-4a8e-841f-ccfae5031532.png"
    },
    {
      "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534(1).png",
      "originalPath": "Lovart\\d3387b00-4b46-4e89-9534-d0b71f0b1534(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 860133,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/d3387b00-4b46-4e89-9534-d0b71f0b1534(1).png"
    },
    {
      "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534(2).png",
      "originalPath": "Lovart\\d3387b00-4b46-4e89-9534-d0b71f0b1534(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14112,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d3387b00-4b46-4e89-9534-d0b71f0b1534(2).png"
    },
    {
      "fileName": "d3387b00-4b46-4e89-9534-d0b71f0b1534.png",
      "originalPath": "Lovart\\d3387b00-4b46-4e89-9534-d0b71f0b1534.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1442,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d3387b00-4b46-4e89-9534-d0b71f0b1534.png"
    },
    {
      "fileName": "d59721da-fd82-4d32-805b-14377478bf3d(1).png",
      "originalPath": "Lovart\\d59721da-fd82-4d32-805b-14377478bf3d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 600384,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/d59721da-fd82-4d32-805b-14377478bf3d(1).png"
    },
    {
      "fileName": "d59721da-fd82-4d32-805b-14377478bf3d(2).png",
      "originalPath": "Lovart\\d59721da-fd82-4d32-805b-14377478bf3d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10674,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d59721da-fd82-4d32-805b-14377478bf3d(2).png"
    },
    {
      "fileName": "d59721da-fd82-4d32-805b-14377478bf3d.png",
      "originalPath": "Lovart\\d59721da-fd82-4d32-805b-14377478bf3d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1358,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d59721da-fd82-4d32-805b-14377478bf3d.png"
    },
    {
      "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a(1).png",
      "originalPath": "Lovart\\d6b2f72b-f624-45cb-836f-27b89263ad4a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 607436,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/d6b2f72b-f624-45cb-836f-27b89263ad4a(1).png"
    },
    {
      "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a(2).png",
      "originalPath": "Lovart\\d6b2f72b-f624-45cb-836f-27b89263ad4a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 14126,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d6b2f72b-f624-45cb-836f-27b89263ad4a(2).png"
    },
    {
      "fileName": "d6b2f72b-f624-45cb-836f-27b89263ad4a.png",
      "originalPath": "Lovart\\d6b2f72b-f624-45cb-836f-27b89263ad4a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1254,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/d6b2f72b-f624-45cb-836f-27b89263ad4a.png"
    },
    {
      "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(1).png",
      "originalPath": "Lovart\\dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 603738,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(1).png"
    },
    {
      "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(2).png",
      "originalPath": "Lovart\\dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12078,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad(2).png"
    },
    {
      "fileName": "dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad.png",
      "originalPath": "Lovart\\dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1146,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/dc7cc8c9-8cd6-498c-8ab6-d7eabcdcdaad.png"
    },
    {
      "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125(1).png",
      "originalPath": "Lovart\\dc8c2b87-8854-4104-aa98-8b9946f39125(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 499883,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/dc8c2b87-8854-4104-aa98-8b9946f39125(1).png"
    },
    {
      "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125(2).png",
      "originalPath": "Lovart\\dc8c2b87-8854-4104-aa98-8b9946f39125(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10218,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/dc8c2b87-8854-4104-aa98-8b9946f39125(2).png"
    },
    {
      "fileName": "dc8c2b87-8854-4104-aa98-8b9946f39125.png",
      "originalPath": "Lovart\\dc8c2b87-8854-4104-aa98-8b9946f39125.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1272,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/dc8c2b87-8854-4104-aa98-8b9946f39125.png"
    },
    {
      "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827(1).png",
      "originalPath": "Lovart\\e0aaf0f4-fd36-4ca6-91bf-6963e817d827(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 575207,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e0aaf0f4-fd36-4ca6-91bf-6963e817d827(1).png"
    },
    {
      "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827(2).png",
      "originalPath": "Lovart\\e0aaf0f4-fd36-4ca6-91bf-6963e817d827(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5972,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e0aaf0f4-fd36-4ca6-91bf-6963e817d827(2).png"
    },
    {
      "fileName": "e0aaf0f4-fd36-4ca6-91bf-6963e817d827.png",
      "originalPath": "Lovart\\e0aaf0f4-fd36-4ca6-91bf-6963e817d827.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 566,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e0aaf0f4-fd36-4ca6-91bf-6963e817d827.png"
    },
    {
      "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b(1).png",
      "originalPath": "Lovart\\e13214bf-314d-4034-a01e-c241aa351f1b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 596486,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e13214bf-314d-4034-a01e-c241aa351f1b(1).png"
    },
    {
      "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b(2).png",
      "originalPath": "Lovart\\e13214bf-314d-4034-a01e-c241aa351f1b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5756,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e13214bf-314d-4034-a01e-c241aa351f1b(2).png"
    },
    {
      "fileName": "e13214bf-314d-4034-a01e-c241aa351f1b.png",
      "originalPath": "Lovart\\e13214bf-314d-4034-a01e-c241aa351f1b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 546,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e13214bf-314d-4034-a01e-c241aa351f1b.png"
    },
    {
      "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(1).png",
      "originalPath": "Lovart\\e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 599491,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(1).png"
    },
    {
      "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(2).png",
      "originalPath": "Lovart\\e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8930,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e1c70a1e-cf2b-4ce8-a133-9b8961b12a19(2).png"
    },
    {
      "fileName": "e1c70a1e-cf2b-4ce8-a133-9b8961b12a19.png",
      "originalPath": "Lovart\\e1c70a1e-cf2b-4ce8-a133-9b8961b12a19.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1142,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e1c70a1e-cf2b-4ce8-a133-9b8961b12a19.png"
    },
    {
      "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a(1).png",
      "originalPath": "Lovart\\e29fa5b0-6264-409d-9244-a6687c052e8a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 571562,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e29fa5b0-6264-409d-9244-a6687c052e8a(1).png"
    },
    {
      "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a(2).png",
      "originalPath": "Lovart\\e29fa5b0-6264-409d-9244-a6687c052e8a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 8916,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e29fa5b0-6264-409d-9244-a6687c052e8a(2).png"
    },
    {
      "fileName": "e29fa5b0-6264-409d-9244-a6687c052e8a.png",
      "originalPath": "Lovart\\e29fa5b0-6264-409d-9244-a6687c052e8a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1168,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e29fa5b0-6264-409d-9244-a6687c052e8a.png"
    },
    {
      "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e(1).png",
      "originalPath": "Lovart\\e2db6c01-a503-4012-9c6e-cffe27f34d2e(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 700105,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e2db6c01-a503-4012-9c6e-cffe27f34d2e(1).png"
    },
    {
      "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e(2).png",
      "originalPath": "Lovart\\e2db6c01-a503-4012-9c6e-cffe27f34d2e(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15224,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e2db6c01-a503-4012-9c6e-cffe27f34d2e(2).png"
    },
    {
      "fileName": "e2db6c01-a503-4012-9c6e-cffe27f34d2e.png",
      "originalPath": "Lovart\\e2db6c01-a503-4012-9c6e-cffe27f34d2e.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1852,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e2db6c01-a503-4012-9c6e-cffe27f34d2e.png"
    },
    {
      "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(1).png",
      "originalPath": "Lovart\\e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 538473,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(1).png"
    },
    {
      "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(2).png",
      "originalPath": "Lovart\\e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 9610,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141(2).png"
    },
    {
      "fileName": "e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141.png",
      "originalPath": "Lovart\\e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1052,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e3b4ff3d-7a50-4b0f-8f45-14d0f9a3f141.png"
    },
    {
      "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a(1).png",
      "originalPath": "Lovart\\e472f1ab-e541-4fe2-add2-d6c1c6fb702a(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 830852,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/e472f1ab-e541-4fe2-add2-d6c1c6fb702a(1).png"
    },
    {
      "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a(2).png",
      "originalPath": "Lovart\\e472f1ab-e541-4fe2-add2-d6c1c6fb702a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15976,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e472f1ab-e541-4fe2-add2-d6c1c6fb702a(2).png"
    },
    {
      "fileName": "e472f1ab-e541-4fe2-add2-d6c1c6fb702a.png",
      "originalPath": "Lovart\\e472f1ab-e541-4fe2-add2-d6c1c6fb702a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1706,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e472f1ab-e541-4fe2-add2-d6c1c6fb702a.png"
    },
    {
      "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(1).png",
      "originalPath": "Lovart\\e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 578329,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(1).png"
    },
    {
      "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(2).png",
      "originalPath": "Lovart\\e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 10684,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e48c07a9-4950-45f0-b1ce-fffd3be6fd9c(2).png"
    },
    {
      "fileName": "e48c07a9-4950-45f0-b1ce-fffd3be6fd9c.png",
      "originalPath": "Lovart\\e48c07a9-4950-45f0-b1ce-fffd3be6fd9c.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 740,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e48c07a9-4950-45f0-b1ce-fffd3be6fd9c.png"
    },
    {
      "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b(1).png",
      "originalPath": "Lovart\\e5089260-90ad-4392-b4aa-c8ec5c83fa4b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 745350,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e5089260-90ad-4392-b4aa-c8ec5c83fa4b(1).png"
    },
    {
      "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b(2).png",
      "originalPath": "Lovart\\e5089260-90ad-4392-b4aa-c8ec5c83fa4b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13028,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e5089260-90ad-4392-b4aa-c8ec5c83fa4b(2).png"
    },
    {
      "fileName": "e5089260-90ad-4392-b4aa-c8ec5c83fa4b.png",
      "originalPath": "Lovart\\e5089260-90ad-4392-b4aa-c8ec5c83fa4b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1524,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e5089260-90ad-4392-b4aa-c8ec5c83fa4b.png"
    },
    {
      "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(1).png",
      "originalPath": "Lovart\\e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 375190,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(1).png"
    },
    {
      "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(2).png",
      "originalPath": "Lovart\\e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5264,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e5748ccd-4db6-4c9a-b1b6-9e8021ce899f(2).png"
    },
    {
      "fileName": "e5748ccd-4db6-4c9a-b1b6-9e8021ce899f.png",
      "originalPath": "Lovart\\e5748ccd-4db6-4c9a-b1b6-9e8021ce899f.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 398,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e5748ccd-4db6-4c9a-b1b6-9e8021ce899f.png"
    },
    {
      "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14(1).png",
      "originalPath": "Lovart\\e610d030-1d1e-47f4-8ef8-88ac5f840c14(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 622303,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e610d030-1d1e-47f4-8ef8-88ac5f840c14(1).png"
    },
    {
      "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14(2).png",
      "originalPath": "Lovart\\e610d030-1d1e-47f4-8ef8-88ac5f840c14(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15184,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e610d030-1d1e-47f4-8ef8-88ac5f840c14(2).png"
    },
    {
      "fileName": "e610d030-1d1e-47f4-8ef8-88ac5f840c14.png",
      "originalPath": "Lovart\\e610d030-1d1e-47f4-8ef8-88ac5f840c14.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1188,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e610d030-1d1e-47f4-8ef8-88ac5f840c14.png"
    },
    {
      "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b(1).png",
      "originalPath": "Lovart\\e8502bc4-4a74-49bf-a8b1-5b077810385b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 795763,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e8502bc4-4a74-49bf-a8b1-5b077810385b(1).png"
    },
    {
      "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b(2).png",
      "originalPath": "Lovart\\e8502bc4-4a74-49bf-a8b1-5b077810385b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15962,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e8502bc4-4a74-49bf-a8b1-5b077810385b(2).png"
    },
    {
      "fileName": "e8502bc4-4a74-49bf-a8b1-5b077810385b.png",
      "originalPath": "Lovart\\e8502bc4-4a74-49bf-a8b1-5b077810385b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1626,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e8502bc4-4a74-49bf-a8b1-5b077810385b.png"
    },
    {
      "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d(1).png",
      "originalPath": "Lovart\\e9e10106-54be-46aa-9ef1-431bb9b89e7d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 683400,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/e9e10106-54be-46aa-9ef1-431bb9b89e7d(1).png"
    },
    {
      "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d(2).png",
      "originalPath": "Lovart\\e9e10106-54be-46aa-9ef1-431bb9b89e7d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 12650,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e9e10106-54be-46aa-9ef1-431bb9b89e7d(2).png"
    },
    {
      "fileName": "e9e10106-54be-46aa-9ef1-431bb9b89e7d.png",
      "originalPath": "Lovart\\e9e10106-54be-46aa-9ef1-431bb9b89e7d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1290,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/e9e10106-54be-46aa-9ef1-431bb9b89e7d.png"
    },
    {
      "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b(1).png",
      "originalPath": "Lovart\\ea95ca79-2933-4cef-b0ce-b69453d8836b(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 503783,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/ea95ca79-2933-4cef-b0ce-b69453d8836b(1).png"
    },
    {
      "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b(2).png",
      "originalPath": "Lovart\\ea95ca79-2933-4cef-b0ce-b69453d8836b(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 5124,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/ea95ca79-2933-4cef-b0ce-b69453d8836b(2).png"
    },
    {
      "fileName": "ea95ca79-2933-4cef-b0ce-b69453d8836b.png",
      "originalPath": "Lovart\\ea95ca79-2933-4cef-b0ce-b69453d8836b.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 534,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/ea95ca79-2933-4cef-b0ce-b69453d8836b.png"
    },
    {
      "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(1).png",
      "originalPath": "Lovart\\efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 808921,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(1).png"
    },
    {
      "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(2).png",
      "originalPath": "Lovart\\efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 15694,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/efa4007e-7c75-4ad2-8b5f-6a49e4d099c4(2).png"
    },
    {
      "fileName": "efa4007e-7c75-4ad2-8b5f-6a49e4d099c4.png",
      "originalPath": "Lovart\\efa4007e-7c75-4ad2-8b5f-6a49e4d099c4.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1740,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/efa4007e-7c75-4ad2-8b5f-6a49e4d099c4.png"
    },
    {
      "fileName": "f24b1997-8258-4300-8899-df366565c4e0(1).png",
      "originalPath": "Lovart\\f24b1997-8258-4300-8899-df366565c4e0(1).png",
      "category": "ui-interface",
      "subcategory": "dashboard",
      "theme": "modern",
      "size": 812988,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/ui-interface/modern/f24b1997-8258-4300-8899-df366565c4e0(1).png"
    },
    {
      "fileName": "f24b1997-8258-4300-8899-df366565c4e0(2).png",
      "originalPath": "Lovart\\f24b1997-8258-4300-8899-df366565c4e0(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 13080,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/f24b1997-8258-4300-8899-df366565c4e0(2).png"
    },
    {
      "fileName": "f24b1997-8258-4300-8899-df366565c4e0.png",
      "originalPath": "Lovart\\f24b1997-8258-4300-8899-df366565c4e0.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1284,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/f24b1997-8258-4300-8899-df366565c4e0.png"
    },
    {
      "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d(1).png",
      "originalPath": "Lovart\\fb7a18e9-0954-4cb7-aa14-14097fa1a79d(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 713187,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/fb7a18e9-0954-4cb7-aa14-14097fa1a79d(1).png"
    },
    {
      "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d(2).png",
      "originalPath": "Lovart\\fb7a18e9-0954-4cb7-aa14-14097fa1a79d(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 11568,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/fb7a18e9-0954-4cb7-aa14-14097fa1a79d(2).png"
    },
    {
      "fileName": "fb7a18e9-0954-4cb7-aa14-14097fa1a79d.png",
      "originalPath": "Lovart\\fb7a18e9-0954-4cb7-aa14-14097fa1a79d.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1100,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/fb7a18e9-0954-4cb7-aa14-14097fa1a79d.png"
    },
    {
      "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a(1).png",
      "originalPath": "Lovart\\fe097527-d9d5-4442-a018-7b79bb23a23a(1).png",
      "category": "components",
      "subcategory": "buttons",
      "theme": "modern",
      "size": 472593,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/components/modern/fe097527-d9d5-4442-a018-7b79bb23a23a(1).png"
    },
    {
      "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a(2).png",
      "originalPath": "Lovart\\fe097527-d9d5-4442-a018-7b79bb23a23a(2).png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 7674,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/fe097527-d9d5-4442-a018-7b79bb23a23a(2).png"
    },
    {
      "fileName": "fe097527-d9d5-4442-a018-7b79bb23a23a.png",
      "originalPath": "Lovart\\fe097527-d9d5-4442-a018-7b79bb23a23a.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 782,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/fe097527-d9d5-4442-a018-7b79bb23a23a.png"
    },
    {
      "fileName": "lovart-avatar.png",
      "originalPath": "Lovart\\lovart-avatar.png",
      "category": "icons",
      "subcategory": "action",
      "theme": "modern",
      "size": 1514,
      "confidence": 0.7,
      "webPath": "/lovart-smart-assets/icons/modern/lovart-avatar.png"
    }
  ]
};

// 按分类获取资源
export function getSmartResourcesByCategory(category: string): SmartLovartResource[] {
  return smartLovartResourceMapping.files.filter((resource: SmartLovartResource) => resource.category === category);
}

// 按主题获取资源
export function getSmartResourcesByTheme(theme: string): SmartLovartResource[] {
  return smartLovartResourceMapping.files.filter((resource: SmartLovartResource) => resource.theme === theme);
}

// 按置信度获取资源
export function getSmartResourcesByConfidence(minConfidence: number): SmartLovartResource[] {
  return smartLovartResourceMapping.files.filter((resource: SmartLovartResource) => resource.confidence >= minConfidence);
}

// 获取特定分类和主题的资源
export function getSmartResourcesByCategoryAndTheme(category: string, theme: string): SmartLovartResource[] {
  return smartLovartResourceMapping.files.filter((resource: SmartLovartResource) =>
    resource.category === category && resource.theme === theme
  );
}

// 获取高置信度资源
export function getHighConfidenceResources(): SmartLovartResource[] {
  return smartLovartResourceMapping.files.filter((resource: SmartLovartResource) => resource.confidence >= 0.8);
}
