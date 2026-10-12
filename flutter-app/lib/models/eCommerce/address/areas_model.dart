// class AreasModel {
//   List<Areas>? areas;
//
//   AreasModel({this.areas});
//
//   AreasModel.fromJson(Map<String, dynamic> json) {
//     if (json['areas'] != null) {
//       areas = <Areas>[];
//       json['areas'].forEach((v) {
//         areas!.add(Areas.fromJson(v));
//       });
//     }
//   }
//
//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     if (areas != null) {
//       data['areas'] = areas!.map((v) => v.toJson()).toList();
//     }
//     return data;
//   }
// }

class AreasModel {
  int? id;
  String? name;
  dynamic deliveryAmount;

  AreasModel({this.id, this.name, this.deliveryAmount});

  AreasModel.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    name = json['name'];
    deliveryAmount = json['delivery_amount'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['name'] = name;
    data['delivery_amount'] = deliveryAmount;
    return data;
  }
}
